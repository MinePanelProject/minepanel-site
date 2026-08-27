import { test, expect, type Page } from '@playwright/test';
import {
	buildSiteData,
	buildTrack,
	clampProgress,
	normalizeStatus,
	parsePhases,
	parseTrackEnvelope
} from '../src/lib/data/validate';
import { BACKEND_URL, FRONTEND_URL, MOBILE_URL } from '../src/lib/data/endpoints';
import { SITE_CONTENT } from '../src/lib/data/site-content';
import { EMPTY_STATE } from '../src/lib/data/fallbacks';

const CAND = 'http://127.0.0.1:8788';
const pageErrors = new WeakMap<Page, string[]>();

async function ready(page: Page, path = '/') {
	await page.goto(`${CAND}${path}`, { waitUntil: 'networkidle' });
	await page.waitForSelector(path === '/' ? '#status' : '.legal-page', { timeout: 30000 });
	await page.evaluate(() => document.fonts.ready);
	await page.evaluate(() => {
		document.querySelectorAll('img').forEach((image) => {
			image.loading = 'eager';
			image.setAttribute('loading', 'eager');
		});
	});
}

test.beforeEach(async ({ page }) => {
	const errors: string[] = [];
	pageErrors.set(page, errors);
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(`console: ${message.text()}`);
	});
	page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
	page.on('requestfailed', (request) => {
		if (!/^https:\/\/(github.com|avatars\.githubusercontent\.com)\//.test(request.url())) {
			errors.push(`requestfailed: ${request.url()}`);
		}
	});
	page.on('response', (response) => {
		if (
			response.status() >= 400 &&
			!/^https:\/\/(github.com|avatars\.githubusercontent\.com)\//.test(response.url())
		) {
			errors.push(`${response.status()}: ${response.url()}`);
		}
	});
});

test.afterEach(async ({ page }) => {
	expect(pageErrors.get(page), 'console/page/network errors observed').toEqual([]);
});

test.describe('homepage maturity pass', () => {
	test('renders status, current capabilities, and roadmap', async ({ page }) => {
		await ready(page);
		await expect(page.locator('#status')).toBeVisible();
		await expect(page.locator('#status-title')).toHaveText('Usable today. Still being built.');
		await expect(page.locator('.status-kicker--live')).toHaveText('[ EARLY ACCESS ]');
		await expect(page.locator('#status')).toContainText('Create, start, stop, restart, and delete Minecraft servers');
		await expect(page.locator('#status')).toContainText('Per-server OPEN, REQUEST, and PRIVATE access controls');
		await expect(page.locator('#roadmap')).toBeVisible();
		await expect(page.locator('.roadmap-tab')).toHaveCount(3);
	});

	test('hero actions explain the deployment and hosted dashboard roles', async ({ page }) => {
		await ready(page);
		await expect(page.locator('.btn-primary')).toHaveAttribute(
			'href',
			'https://github.com/MinePanelProject/minepanel-backend#quick-deploy'
		);
		await expect(page.locator('.btn-secondary')).toHaveAttribute('href', 'https://app.minepanel.xyz');
		await expect(page.locator('.hero-app-note')).toContainText('self-hosted MinePanel instance');
		await expect(page.locator('.hero-links a')).toHaveCount(2);
	});

	test('quick deploy is current and footer links are present', async ({ page }) => {
		await ready(page);
		const deploy = page.locator('.deploy-box');
		await expect(deploy).toContainText('git clone');
		await expect(deploy).toContainText('cp .env.example .env');
		await expect(deploy).toContainText('docker compose pull');
		await expect(deploy).toContainText('docker compose up');
		await expect(deploy).not.toContainText('public release coming soon');
		await expect(page.locator('footer')).toBeVisible();
		await expect(page.locator('footer')).not.toContainText('MinePanel contributors');
		await expect(page.locator('footer a[href="/privacy"]')).toHaveCount(1);
	});

	test('privacy route has dedicated metadata and notice content', async ({ page }) => {
		await ready(page, '/privacy');
		await expect(page).toHaveTitle('Privacy Notice - MinePanel');
		await expect(page.locator('h1')).toHaveText('Privacy Notice');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://minepanel.xyz/privacy');
		await expect(page.locator('.legal-page')).toContainText('does not set cookies');
		await expect(page.locator('.legal-page')).toContainText('avatars.githubusercontent.com');
		await expect(page.locator('.legal-page')).toContainText('not used by MinePanel as analytics');
		await expect(page.locator('.legal-page')).toContainText('Cloudflare Pages/Workers');
		await expect(page.locator('.legal-page')).toContainText('Last updated:');
	});

	test('back to top and roadmap interactions remain usable', async ({ page }) => {
		await ready(page);
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await expect(page.locator('.back-to-top')).toHaveClass(/visible/);
		await page.locator('.back-to-top').click();
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

		await page.click('#roadmap-tab-frontend');
		await expect(page.locator('#roadmap-panel-frontend')).toBeVisible();
		await expect(page.locator('#roadmap-panel-backend')).toBeHidden();
		await page.focus('#roadmap-tab-frontend');
		await page.keyboard.press('ArrowRight');
		await expect(page.locator('#roadmap-tab-mobile')).toHaveAttribute('aria-selected', 'true');
	});

	test('mobile navigation opens, closes, and retains valid links', async ({ page }) => {
		await ready(page);
		await page.setViewportSize({ width: 375, height: 812 });
		const toggle = page.locator('.nav-toggle');
		await toggle.click();
		await expect(page.locator('.nav-links')).toBeVisible();
		await expect(page.locator('.nav-links a[href="#status"]')).toHaveCount(1);
		await page.click('.nav-links a[href="#status"]');
		await expect(page.locator('.nav-links')).toBeHidden();
		await toggle.click();
		await page.keyboard.press('Escape');
		await expect(page.locator('.nav-links')).toBeHidden();
		expect(await page.evaluate(() => document.activeElement?.classList.contains('nav-toggle'))).toBe(true);
	});

	test('team avatars remain GitHub-hosted and local fonts resolve', async ({ page }) => {
		const thirdParty: string[] = [];
		const fonts: string[] = [];
		page.on('request', (request) => {
			const url = request.url();
			if (!url.startsWith(CAND) && !url.startsWith('data:')) thirdParty.push(url);
			if (url.endsWith('.woff2')) fonts.push(url);
		});
		await ready(page);
		await expect(page.locator('.team-block-avatar')).toHaveCount(3);
		expect(thirdParty.length).toBeGreaterThanOrEqual(3);
		expect(
			thirdParty.every((url) => url.startsWith('https://avatars.githubusercontent.com/'))
		).toBe(true);
		expect(fonts.some((url) => url.includes('/fonts/press-start-2p-latin.woff2'))).toBe(true);
		expect(fonts.some((url) => url.includes('/fonts/vt323-latin.woff2'))).toBe(true);
		const css = await page.evaluate(() =>
			[...document.styleSheets]
				.flatMap((sheet) => {
					try {
						return [...sheet.cssRules].map((rule) => rule.cssText);
					} catch {
						return [];
					}
				})
				.join('\n')
		);
		expect(css).not.toContain('fonts.googleapis.com');
		expect(css).not.toContain('fonts.gstatic.com');
	});

	test('content remains available with JavaScript disabled', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto(CAND, { waitUntil: 'networkidle' });
		await expect(page.locator('#status')).toBeVisible();
		await expect(page.locator('.feature-card')).toHaveCount(8);
		await expect(page.locator('.stack-pill')).toHaveCount(13);
		await expect(page.locator('.team-block')).toHaveCount(3);
		expect(await page.locator('.tl-phase-block').count()).toBeGreaterThan(0);
		await context.close();
	});
});

test.describe('data layer: ownership and roadmap fixtures', () => {
	test('roadmap endpoints use independently owned roadmap files', () => {
		expect(BACKEND_URL).toMatch(/minepanel-backend\/refs\/heads\/master\/roadmap\.json$/);
		expect(FRONTEND_URL).toMatch(/minepanel-pwa\/refs\/heads\/master\/roadmap\.json$/);
		expect(MOBILE_URL).toMatch(/minepanel-mobile\/refs\/heads\/master\/roadmap\.json$/);
	});

	test('site presentation is local and remote roadmap data cannot replace it', () => {
		expect(SITE_CONTENT.features).toHaveLength(8);
		expect(SITE_CONTENT.stack).toHaveLength(13);
		expect(SITE_CONTENT.team).toHaveLength(3);
		expect(SITE_CONTENT.team.map((member) => member.githubId)).toEqual([17621558, 122992858, 242011098]);
		expect(
			SITE_CONTENT.team.every((member) => member.avatarSrc.startsWith('https://avatars.githubusercontent.com/'))
		).toBe(true);

		const data = buildSiteData({
			backend: {
				meta: { title: 'remote content must not be used' },
				features: [],
				techStack: [],
				team: [],
				phases: []
			},
			frontend: null,
			mobile: null
		});
		expect(data.content).toBe(SITE_CONTENT);
		expect(data.content.metadata.title).toBe('MinePanel - Self-Hosted Minecraft Server Manager');
		expect(data.tracks.find((track) => track.key === 'backend')?.phases).toBeNull();
	});

	test('published roadmap envelope is parsed with phases and updatedAt', () => {
		const track = parseTrackEnvelope({
			updatedAt: '2026-05-01',
			phases: [
				{
					id: '1',
					label: 'Phase 1',
					name: 'Web Dashboard',
					status: 'wip',
					description: 'Milestone',
					items: [{ text: 'item', done: false }],
					progress: 50,
					progressLabel: '50%'
				}
			]
		});
		expect(track.phases).toHaveLength(1);
		expect(track.updatedAt).toBe('2026-05-01');
		expect(track.phases?.[0].status).toBe('wip');
		const built = buildTrack(
			'frontend',
			'Web',
			'Dashboard',
			'[ Dashboard / Web ]',
			EMPTY_STATE.frontend,
			track.phases,
			track.updatedAt
		);
		expect(built.sourceNote).toBe('[ live data - last updated: 2026-05-01 ]');
		expect(built.stateText).toBe('[ 1 PHASE ]');
	});

	test('one unavailable roadmap source degrades independently', () => {
		const data = buildSiteData({
			backend: null,
			frontend: {
				updatedAt: '2026-05-01',
				phases: [
					{
						id: '1',
						label: 'Phase 1',
						name: 'Dashboard',
						status: 'done',
						description: 'Published',
						items: []
					}
				]
			},
			mobile: null
		});
		expect(data.tracks.find((track) => track.key === 'backend')?.sourceNote).toBe('[ roadmap data unavailable ]');
		expect(data.tracks.find((track) => track.key === 'frontend')?.phases).toHaveLength(1);
		expect(data.tracks.find((track) => track.key === 'mobile')?.sourceNote).toBe('[ public roadmap not published ]');
	});

	test('status normalization and progress clamping', () => {
		expect(normalizeStatus('completed')).toBe('done');
		expect(normalizeStatus('done')).toBe('done');
		expect(normalizeStatus('wip')).toBe('wip');
		expect(normalizeStatus('future')).toBe('future');
		expect(normalizeStatus('unknown')).toBe('planned');
		expect(clampProgress(150)).toBe(100);
		expect(clampProgress(-5)).toBe(0);
		expect(clampProgress(42)).toBe(42);
		expect(clampProgress('nope')).toBeNull();
	});

	test('hostile remote roadmap content stays data in the normalized view model', () => {
		const phases = parsePhases([
			{
				id: '1',
				label: '<b>x</b>',
				name: 'phase',
				status: 'planned',
				description: '& < > "',
				items: [{ text: '<svg onload=alert(1)>', done: false }]
			}
		]);
		expect(phases[0].label).toBe('<b>x</b>');
		expect(phases[0].items[0].text).toBe('<svg onload=alert(1)>');
	});
});
