import { test, expect, type Page, type Browser } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
	buildSiteData,
	buildTrack,
	clampProgress,
	isSafeGitHubUrl,
	isValidUsername,
	normalizeStatus,
	parseFeatures,
	parsePhases,
	parseStack,
	parseTeam,
	parseTrackEnvelope
} from '../src/lib/data/validate';
import { EMPTY_STATE } from '../src/lib/data/fallbacks';

const REF = 'http://127.0.0.1:8099/';
const CAND = 'http://127.0.0.1:8788/';
const OUT = resolve(process.cwd(), 'test-results');
mkdirSync(OUT, { recursive: true });

declare global {
	interface Window {
		__copied?: string;
		__selected?: string;
		__execCount?: number;
	}
}

async function ready(page: Page, url: string, selector: string) {
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.waitForSelector(selector, { timeout: 30000 });
	await page.evaluate(() => document.fonts.ready);
	// force eager loading so lazy images are deterministic during full-page capture
	await page.evaluate(() => {
		document.querySelectorAll('img').forEach((i) => {
			i.loading = 'eager';
			i.setAttribute('loading', 'eager');
		});
	});
	await page.waitForFunction(
		() => [...document.images].every((i) => i.complete && i.naturalWidth > 0),
		undefined,
		{ timeout: 30000 }
	);
	await page.waitForTimeout(800);
	// disable transitions/animations for deterministic default-state capture
	await page.addStyleTag({
		content: '*,*::before,*::after{animation:none!important;transition:none!important}'
	});
}

async function resolveVar(page: Page, name: string) {
	return page.evaluate((n) => {
		const probe = document.createElement('div');
		probe.style.color = `var(${n})`;
		document.body.appendChild(probe);
		const c = getComputedStyle(probe).color;
		probe.remove();
		return c;
	}, name);
}

async function fullShot(page: Page, name: string) {
	const shot = await page.screenshot({ fullPage: true });
	writeFileSync(resolve(OUT, `${name}.png`), shot);
	return shot;
}

function diffPixels(a: Buffer, b: Buffer, name: string) {
	const pa = PNG.sync.read(a);
	const pb = PNG.sync.read(b);
	if (pa.width !== pb.width || pa.height !== pb.height) {
		throw new Error(`${name}: size mismatch ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}`);
	}
	const diff = new PNG({ width: pa.width, height: pa.height });
	const n = pixelmatch(pa.data, pb.data, diff.data, pa.width, pa.height, {
		threshold: 0.1,
		includeAA: false
	});
	writeFileSync(resolve(OUT, `${name}.diff.png`), PNG.sync.write(diff));
	return n;
}

async function shots(page: Page, viewport: [number, number], tag: string) {
	await page.setViewportSize({ width: viewport[0], height: viewport[1] });
	await page.waitForTimeout(300);
	const body = await page.screenshot({ fullPage: true });
	writeFileSync(resolve(OUT, `${tag}.${viewport[0]}x${viewport[1]}.png`), body);
	return body;
}

interface TestState {
	errs: string[];
	http: string[];
}

const pageState = new WeakMap<Page, TestState>();

function stateFor(page: Page): TestState {
	let s = pageState.get(page);
	if (!s) {
		s = { errs: [], http: [] };
		pageState.set(page, s);
	}
	return s;
}

/** Capture console/page errors on every page and fail the test if any occur.
 * The reference page intentionally triggers two roadmap 404s (frontend/mobile
 * endpoints) — those specific responses and their console lines are allowed,
 * as are GitHub API/avatar 403s (unauthenticated rate limits are
 * environmental and vary between runs). */
test.beforeEach(async ({ page }) => {
	const st = stateFor(page);
	st.errs = [];
	st.http = [];
	page.on('console', (m) => {
		if (m.type() !== 'error') return;
		const loc = m.location();
		const url = loc && loc.url ? loc.url : '';
		// intentional reference roadmap 404s (exact endpoint URLs)
		if (
			/^https:\/\/raw\.githubusercontent\.com\/MinePanelProject\/(minepanel-frontend|minepanel-mobile)\/refs\/heads\/master\/roadmap\.json$/.test(
				url
			)
		) {
			return;
		}
		// environmental GitHub API/avatar rate limits (403 only)
		if (/^https:\/\/(api\.github\.com|github\.com)\//.test(url) && m.text().includes('403')) return;
		st.errs.push('console: ' + m.text() + ' @ ' + url);
	});
	page.on('pageerror', (e) => {
		st.errs.push('pageerror: ' + e.message);
	});
	page.on('requestfailed', (r) => {
		st.errs.push('requestfailed: ' + r.url());
	});
	page.on('response', (r) => {
		if (r.status() >= 400 && r.status() < 600) {
			st.http.push(`${r.status()}: ${r.url()}`);
		}
	});
});
test.afterEach(async ({ page }) => {
	const st = stateFor(page);
	expect(st.errs, 'console/page errors observed').toEqual([]);
	const http = st.http.filter((u) => {
		if (
			/404: https:\/\/raw\.githubusercontent\.com\/MinePanelProject\/(minepanel-frontend|minepanel-mobile)\/refs\/heads\/master\/roadmap\.json$/.test(
				u
			)
		) {
			return false;
		}
		if (/403: https:\/\/(api\.github\.com|github\.com)\//.test(u)) return false;
		return true;
	});
	expect(http, 'unexpected HTTP >= 400 responses').toEqual([]);
});

test.describe('pixel parity', () => {
	for (const vp of [
		[375, 812],
		[1280, 900]
	] as [number, number][]) {
		test(`full page ${vp[0]}x${vp[1]}`, async ({ page }) => {
			await ready(page, REF, '.feature-card');
			const ref = await shots(page, vp, 'ref');
			await ready(page, CAND, '.feature-card');
			const cand = await shots(page, vp, 'cand');
			const n = diffPixels(ref, cand, `parity.${vp[0]}x${vp[1]}`);
			expect(n, `differing pixels at ${vp[0]}x${vp[1]}`).toBe(0);
		});
	}
});

test.describe('computed style spot checks', () => {
	test('tokens and body', async ({ page }) => {
		await ready(page, REF, '.feature-card');
		const ref = await page.evaluate(() => {
			const cs = getComputedStyle(document.body);
			return {
				bodyFont: cs.fontFamily,
				bodySize: cs.fontSize,
				bodyLineHeight: cs.lineHeight,
				bodyColor: cs.color,
				bodyBg: cs.backgroundImage
			};
		});
		const refVars = {
			bg: await resolveVar(page, '--bg'),
			green: await resolveVar(page, '--green'),
			green2: await resolveVar(page, '--green2'),
			border: await resolveVar(page, '--border'),
			gray: await resolveVar(page, '--gray')
		};
		await ready(page, CAND, '.feature-card');
		const cand = await page.evaluate(() => {
			const cs = getComputedStyle(document.body);
			return {
				bodyFont: cs.fontFamily,
				bodySize: cs.fontSize,
				bodyLineHeight: cs.lineHeight,
				bodyColor: cs.color,
				bodyBg: cs.backgroundImage
			};
		});
		const candVars = {
			bg: await resolveVar(page, '--bg'),
			green: await resolveVar(page, '--green'),
			green2: await resolveVar(page, '--green2'),
			border: await resolveVar(page, '--border'),
			gray: await resolveVar(page, '--gray')
		};
		expect(cand).toEqual(ref);
		expect(candVars).toEqual(refVars);
	});

	test('nav + hero', async ({ page }) => {
		await ready(page, REF, '.feature-card');
		const ref = await page.evaluate(() => {
			const pick = (sel: string) => {
				const el = document.querySelector(sel);
				if (!el) return null;
				const cs = getComputedStyle(el);
				return { font: cs.fontFamily, size: cs.fontSize, color: cs.color, bg: cs.backgroundColor };
			};
			return {
				nav: pick('nav'),
				logoImg: (() => {
					const el = document.querySelector('.logo-img');
					return el ? Math.round(el.getBoundingClientRect().width) : null;
				})(),
				heroH1: pick('.hero h1'),
				heroMark: (() => {
					const el = document.querySelector('.hero-mark');
					return el ? Math.round(el.getBoundingClientRect().width) : null;
				})(),
				subtitle: pick('.hero .subtitle'),
				btnPrimary: pick('.btn-primary'),
				btnSecondary: pick('.btn-secondary')
			};
		});
		await ready(page, CAND, '.feature-card');
		const cand = await page.evaluate(() => {
			const pick = (sel: string) => {
				const el = document.querySelector(sel);
				if (!el) return null;
				const cs = getComputedStyle(el);
				return { font: cs.fontFamily, size: cs.fontSize, color: cs.color, bg: cs.backgroundColor };
			};
			return {
				nav: pick('nav'),
				logoImg: (() => {
					const el = document.querySelector('.logo-img');
					return el ? Math.round(el.getBoundingClientRect().width) : null;
				})(),
				heroH1: pick('.hero h1'),
				heroMark: (() => {
					const el = document.querySelector('.hero-mark');
					return el ? Math.round(el.getBoundingClientRect().width) : null;
				})(),
				subtitle: pick('.hero .subtitle'),
				btnPrimary: pick('.btn-primary'),
				btnSecondary: pick('.btn-secondary')
			};
		});
		expect(cand).toEqual(ref);
	});

	test('team + roadmap', async ({ page }) => {
		await ready(page, REF, '.feature-card');
		const ref = await page.evaluate(() => {
			const pick = (sel: string) => {
				const el = document.querySelector(sel);
				if (!el) return null;
				const cs = getComputedStyle(el);
				return { font: cs.fontFamily, size: cs.fontSize, color: cs.color, bg: cs.backgroundColor };
			};
			return {
				teamAvatar: (() => {
					const el = document.querySelector('.team-block-avatar');
					return el ? Math.round(el.getBoundingClientRect().width) : null;
				})(),
				teamName: pick('.team-block-name'),
				tab: pick('.roadmap-tab'),
				tabState: pick('.roadmap-tab-state'),
				stage: (() => {
					const el = document.querySelector('.roadmap-stage');
					const cs = el ? getComputedStyle(el) : null;
					return cs ? { bg: cs.backgroundColor, padding: cs.padding } : null;
				})(),
				dot: pick('.tl-dot'),
				badge: pick('.tl-badge'),
				body: (() => {
					const el = document.querySelector('.tl-body');
					return el ? getComputedStyle(el).padding : null;
				})(),
				progressFill: (() => {
					const el = document.querySelector('.progress-bar-fill');
					return el ? getComputedStyle(el).backgroundImage : null;
				})()
			};
		});
		await ready(page, CAND, '.feature-card');
		const cand = await page.evaluate(() => {
			const pick = (sel: string) => {
				const el = document.querySelector(sel);
				if (!el) return null;
				const cs = getComputedStyle(el);
				return { font: cs.fontFamily, size: cs.fontSize, color: cs.color, bg: cs.backgroundColor };
			};
			return {
				teamAvatar: (() => {
					const el = document.querySelector('.team-block-avatar');
					return el ? Math.round(el.getBoundingClientRect().width) : null;
				})(),
				teamName: pick('.team-block-name'),
				tab: pick('.roadmap-tab'),
				tabState: pick('.roadmap-tab-state'),
				stage: (() => {
					const el = document.querySelector('.roadmap-stage');
					const cs = el ? getComputedStyle(el) : null;
					return cs ? { bg: cs.backgroundColor, padding: cs.padding } : null;
				})(),
				dot: pick('.tl-dot'),
				badge: pick('.tl-badge'),
				body: (() => {
					const el = document.querySelector('.tl-body');
					return el ? getComputedStyle(el).padding : null;
				})(),
				progressFill: (() => {
					const el = document.querySelector('.progress-bar-fill');
					return el ? getComputedStyle(el).backgroundImage : null;
				})()
			};
		});
		expect(cand).toEqual(ref);
	});
});

test.describe('responsive boundary parity', () => {
	for (const w of [600, 601, 639, 640, 750, 751]) {
		test(`boundary ${w}px`, async ({ page }) => {
			await ready(page, REF, '.feature-card');
			await page.setViewportSize({ width: w, height: 900 });
			await page.waitForTimeout(250);
			const ref = await page.evaluate(() => ({
				featureBasis: getComputedStyle(document.querySelector('.feature-card')!).flexBasis,
				toggleDisplay: getComputedStyle(document.querySelector('.nav-toggle')!).display,
				teamCols: getComputedStyle(document.querySelector('.team-roster')!).gridTemplateColumns,
				heroDir: getComputedStyle(document.querySelector('.hero-title')!).flexDirection,
				tabSubtitle: getComputedStyle(document.querySelector('.roadmap-tab-subtitle')!).display,
				dotWidth: getComputedStyle(document.querySelector('.tl-dot')!).width
			}));
			await ready(page, CAND, '.feature-card');
			await page.setViewportSize({ width: w, height: 900 });
			await page.waitForTimeout(250);
			const cand = await page.evaluate(() => ({
				featureBasis: getComputedStyle(document.querySelector('.feature-card')!).flexBasis,
				toggleDisplay: getComputedStyle(document.querySelector('.nav-toggle')!).display,
				teamCols: getComputedStyle(document.querySelector('.team-roster')!).gridTemplateColumns,
				heroDir: getComputedStyle(document.querySelector('.hero-title')!).flexDirection,
				tabSubtitle: getComputedStyle(document.querySelector('.roadmap-tab-subtitle')!).display,
				dotWidth: getComputedStyle(document.querySelector('.tl-dot')!).width
			}));
			expect(cand).toEqual(ref);
		});
	}
});

test.describe('interaction + a11y parity', () => {
	test('tabs keyboard + panels + source note', async ({ page }) => {
		await ready(page, CAND, '.feature-card');
		await expect(page.locator('#roadmap-panel-backend')).toBeVisible();
		await page.click('#roadmap-tab-frontend');
		await expect(page.locator('#roadmap-panel-frontend')).toBeVisible();
		await expect(page.locator('#roadmap-panel-backend')).toBeHidden();
		expect(await page.locator('#roadmap-tab-frontend').getAttribute('aria-selected')).toBe('true');
		expect(await page.locator('#data-source').textContent()).toContain('not published');
		await page.focus('#roadmap-tab-frontend');
		await page.keyboard.press('ArrowRight');
		expect(await page.locator('#roadmap-tab-mobile').getAttribute('aria-selected')).toBe('true');
		expect(await page.evaluate(() => document.activeElement?.id)).toBe('roadmap-tab-mobile');
		await page.keyboard.press('Home');
		expect(await page.locator('#roadmap-tab-backend').getAttribute('aria-selected')).toBe('true');
		await page.keyboard.press('End');
		expect(await page.locator('#roadmap-tab-mobile').getAttribute('aria-selected')).toBe('true');
		// wrapping: ArrowRight from mobile wraps to backend; ArrowLeft from backend wraps to mobile
		await page.keyboard.press('ArrowRight');
		expect(await page.locator('#roadmap-tab-backend').getAttribute('aria-selected')).toBe('true');
		await page.keyboard.press('ArrowLeft');
		expect(await page.locator('#roadmap-tab-mobile').getAttribute('aria-selected')).toBe('true');
		await page.keyboard.press('ArrowLeft');
		expect(await page.locator('#roadmap-tab-frontend').getAttribute('aria-selected')).toBe('true');
	});

	test('phase collapse: click + Enter + Space + aria + unique ids', async ({ page }) => {
		await ready(page, CAND, '.feature-card');
		const toggle = page.locator('.tl-phase-toggle').nth(1); // Phase 1.5 open by default
		const block = page.locator('.tl-phase-block').nth(1);
		expect(await toggle.getAttribute('aria-expanded')).toBe('true');
		await toggle.click();
		expect(await block.getAttribute('class')).toContain('phase-collapsed');
		expect(await toggle.getAttribute('aria-expanded')).toBe('false');
		await toggle.focus();
		await page.keyboard.press('Enter');
		expect(await block.getAttribute('class')).not.toContain('phase-collapsed');
		expect(await toggle.getAttribute('aria-expanded')).toBe('true');
		await page.keyboard.press('Space');
		expect(await block.getAttribute('class')).toContain('phase-collapsed');
		expect(await toggle.getAttribute('aria-expanded')).toBe('false');
		// every aria-controls target exists and body ids are document-unique
		const ids = await page.evaluate(() => [...document.querySelectorAll('.tl-body')].map((b) => b.id));
		expect(new Set(ids).size).toBe(ids.length);
		const dangling = await page.evaluate(() =>
			[...document.querySelectorAll('.tl-phase-toggle')].filter(
				(t) => !document.getElementById(t.getAttribute('aria-controls')!)
			).length
		);
		expect(dangling).toBe(0);
	});

	test('copy button: native clipboard success path', async ({ page }) => {
		await ready(page, CAND, '.feature-card');
		await page.evaluate(() => {
			Object.defineProperty(navigator, 'clipboard', {
				value: {
					writeText: (t: string) => {
						window.__copied = t;
						return Promise.resolve();
					}
				},
				configurable: true
			});
		});
		await page.click('#copy-deploy');
		await expect(page.locator('#copy-deploy')).toHaveText('[ Copied! ]');
		const copied = await page.evaluate(() => window.__copied ?? '');
		expect(copied).toContain('git clone');
		expect(copied).toContain('docker compose up');
		await page.waitForTimeout(2200);
		await expect(page.locator('#copy-deploy')).toHaveText('[ Copy ]');
	});

	test('copy button: successful execCommand fallback', async ({ page }) => {
		await ready(page, CAND, '.feature-card');
		await page.evaluate(() => {
			Object.defineProperty(navigator, 'clipboard', {
				value: { writeText: () => Promise.reject(new Error('denied')) },
				configurable: true
			});
			window.__selected = '';
			window.__execCount = 0;
			Object.defineProperty(document, 'execCommand', {
				value: () => {
					const sel = window.getSelection();
					window.__selected = sel ? sel.toString() : '';
					window.__execCount = (window.__execCount ?? 0) + 1;
					return true;
				},
				configurable: true
			});
		});
		await page.click('#copy-deploy');
		await expect(page.locator('#copy-deploy')).toHaveText('[ Copied! ]');
		const state = await page.evaluate(() => ({
			execCount: window.__execCount ?? 0,
			selected: window.__selected ?? ''
		}));
		expect(state.execCount).toBe(1);
		expect(state.selected).toContain('git clone');
		expect(state.selected).toContain('docker compose up');
		await page.waitForTimeout(2200);
		await expect(page.locator('#copy-deploy')).toHaveText('[ Copy ]');
	});

	test('copy button: failing fallback label', async ({ page }) => {
		await ready(page, CAND, '.feature-card');
		await page.evaluate(() => {
			Object.defineProperty(navigator, 'clipboard', {
				value: { writeText: () => Promise.reject(new Error('denied')) },
				configurable: true
			});
			// force fallback failure: execCommand unavailable
			Object.defineProperty(document, 'execCommand', {
				value: () => false,
				configurable: true
			});
		});
		await page.click('#copy-deploy');
		await expect(page.locator('#copy-deploy')).toHaveText('[ Copy failed ]');
		await page.waitForTimeout(2200);
		await expect(page.locator('#copy-deploy')).toHaveText('[ Copy ]');
	});

	test('mobile menu open/close: link click, outside click, Escape focus return', async ({ page }) => {
		await ready(page, CAND, '.feature-card');
		await page.setViewportSize({ width: 375, height: 812 });
		const toggle = page.locator('.nav-toggle');
		await toggle.click();
		await expect(page.locator('.nav-links')).toBeVisible();
		expect(await toggle.getAttribute('aria-expanded')).toBe('true');
		// link click closes
		await page.click('.nav-links a[href="#features"]');
		await expect(page.locator('.nav-links')).toBeHidden();
		expect(await toggle.getAttribute('aria-expanded')).toBe('false');
		// outside click closes
		await toggle.click();
		await expect(page.locator('.nav-links')).toBeVisible();
		await page.click('.hero');
		await expect(page.locator('.nav-links')).toBeHidden();
		// Escape returns focus to toggle
		await toggle.click();
		await page.keyboard.press('Escape');
		await expect(page.locator('.nav-links')).toBeHidden();
		expect(await page.evaluate(() => document.activeElement?.classList.contains('nav-toggle'))).toBe(true);
	});

	test('no data/API requests from the migrated page', async ({ page }) => {
		const bad: string[] = [];
		page.on('request', (r) => {
			const u = r.url();
			if (/raw\.githubusercontent\.com|api\.github\.com/.test(u)) bad.push(u);
		});
		await ready(page, CAND, '.feature-card');
		expect(bad).toEqual([]);
	});

	test('content present with JavaScript disabled', async ({ browser }) => {
		const ctx = await browser.newContext({ javaScriptEnabled: false });
		const page = await ctx.newPage();
		await page.goto(CAND, { waitUntil: 'networkidle' });
		await expect(page.locator('.feature-card')).toHaveCount(8);
		await expect(page.locator('.stack-pill')).toHaveCount(13);
		await expect(page.locator('.team-block')).toHaveCount(3);
		await expect(page.locator('.tl-phase-block')).toHaveCount(6);
		// stars element always exists; visible with a number when the build-time
		// GitHub API call succeeded, hidden when it was rate-limited/unavailable
		await expect(page.locator('#gh-stars')).toHaveCount(1);
		const starsHidden = await page.locator('#gh-stars').getAttribute('hidden');
		if (starsHidden === null) {
			await expect(page.locator('#gh-stars .nav-stars-num')).toHaveText(/\d+/);
		}
		await ctx.close();
	});
});

test.describe('state parity: hover / focus / active', () => {
	const measure = (page: Page, sel: string) =>
		page.evaluate((s) => {
			const el = document.querySelector(s) as HTMLElement | null;
			if (!el) return null;
			const cs = getComputedStyle(el);
			const out: Record<string, string> = {
				color: cs.color,
				bg: cs.backgroundColor,
				borderColor: cs.borderColor,
				transform: cs.transform,
				boxShadow: cs.boxShadow,
				filter: cs.filter
			};
			const child = el.querySelector('.roadmap-tab-state') as HTMLElement | null;
			if (child) out.childColor = getComputedStyle(child).color;
			return out;
		}, sel);

	test('hover styles match reference for every target', async ({ page }) => {
		const pairs: Array<[string, string]> = [
			['nav .logo', '.logo'],
			['nav .nav-links a', '.nav-links a'],
			['.btn-primary', '.btn-primary'],
			['.btn-secondary', '.btn-secondary'],
			['.roadmap-tab', '.roadmap-tab'],
			['.team-block', '.team-block'],
			['.copy-btn', '.copy-btn']
		];
		for (const [refSel, candSel] of pairs) {
			await ready(page, REF, '.feature-card');
			await page.hover(refSel);
			await page.waitForTimeout(150);
			const ref = await measure(page, refSel);
			await ready(page, CAND, '.feature-card');
			await page.hover(candSel);
			await page.waitForTimeout(150);
			const cand = await measure(page, candSel);
			expect(cand, `hover state ${refSel}`).toEqual(ref);
		}
	});

	test('active styles match reference where distinct rules exist', async ({ page }) => {
		for (const sel of ['.btn-primary', '.btn-secondary', '.copy-btn']) {
			await ready(page, REF, '.feature-card');
			await page.hover(sel);
			await page.mouse.down();
			const ref = await measure(page, sel);
			await page.mouse.up();
			await ready(page, CAND, '.feature-card');
			await page.hover(sel);
			await page.mouse.down();
			const cand = await measure(page, sel);
			await page.mouse.up();
			expect(cand, `active state ${sel}`).toEqual(ref);
		}
	});

	test('mobile toggle hover matches reference', async ({ page }) => {
		let refToggle: Record<string, string> | null = null;
		for (const url of [REF, CAND]) {
			await ready(page, url, '.feature-card');
			await page.setViewportSize({ width: 375, height: 812 });
			await page.hover('.nav-toggle');
			await page.waitForTimeout(150);
			const got = await measure(page, '.nav-toggle');
			if (url === REF) {
				refToggle = got;
			} else {
				expect(got, 'nav-toggle hover').toEqual(refToggle);
			}
		}
	});

	test('focus-visible ring is a visible aqua outline via keyboard', async ({ page }) => {
		for (const url of [REF, CAND]) {
			await ready(page, url, '.feature-card');
			await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
			for (let i = 0; i < 30; i++) {
				await page.keyboard.press('Tab');
				const isTab = await page.evaluate(() =>
					document.activeElement?.classList.contains('roadmap-tab')
				);
				if (isTab) break;
			}
			const got = await page.evaluate(() => {
				const cs = getComputedStyle(document.activeElement as Element);
				return {
					width: cs.outlineWidth,
					style: cs.outlineStyle,
					color: cs.outlineColor,
					offset: cs.outlineOffset
				};
			});
			// reference CSS: 3px solid var(--aqua), offset 2px — must be visible,
			// not merely identical
			expect(got.width).toBe('3px');
			expect(got.style).toBe('solid');
			expect(got.color).toBe('rgb(85, 255, 255)');
			expect(got.offset).toBe('2px');
		}
	});
});

test.describe('asset parity', () => {
	test('assets served byte-identical', async ({ request }) => {
		const assets = ['favicon.png', 'logo-hero.png', 'icon-512.png', 'og.png'];
		for (const a of assets) {
			const ref = await (await request.get(`${REF}${a}`)).body();
			const cand = await (await request.get(`${CAND}${a}`)).body();
			expect(cand.equals(ref), `${a} differs`).toBe(true);
		}
	});
});

test.describe('data layer: security and envelope fixtures', () => {
	test('published roadmap envelope is parsed with phases + updatedAt', () => {
		const env = {
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
		};
		const track = parseTrackEnvelope(env);
		expect(track.phases?.length).toBe(1);
		expect(track.updatedAt).toBe('2026-05-01');
		expect(track.phases?.[0].status).toBe('wip');
		// a published non-backend track must show a live source note
		const built = buildTrack('frontend', 'Web', 'Dashboard', '[ Dashboard / Web ]', EMPTY_STATE.frontend, track.phases, track.updatedAt);
		expect(built.sourceNote).toBe('[ live data - last updated: 2026-05-01 ]');
		expect(built.stateText).toBe('[ 1 PHASE ]');
	});

	test('backend invalid phases always yield unavailable note', () => {
		const empty = buildTrack('backend', 'Backend', 'Core API', '[ Backend / Core API ]', EMPTY_STATE.backend, null, null);
		expect(empty.sourceNote).toBe('[ roadmap data unavailable ]');
		const recordWithoutPhases = parseTrackEnvelope({ foo: 'bar' });
		expect(recordWithoutPhases.phases).toBeNull();
		const built = buildTrack('backend', 'Backend', 'Core API', '[ Backend / Core API ]', EMPTY_STATE.backend, recordWithoutPhases.phases, null);
		expect(built.sourceNote).toBe('[ roadmap data unavailable ]');
	});

	test('status normalization and progress clamping', () => {
		expect(normalizeStatus('completed')).toBe('done');
		expect(normalizeStatus('done')).toBe('done');
		expect(normalizeStatus('wip')).toBe('wip');
		expect(normalizeStatus('future')).toBe('future');
		expect(normalizeStatus('unknown')).toBe('planned');
		expect(normalizeStatus(undefined)).toBe('planned');
		expect(clampProgress(150)).toBe(100);
		expect(clampProgress(-5)).toBe(0);
		expect(clampProgress(42)).toBe(42);
		expect(clampProgress('nope')).toBeNull();
		expect(clampProgress(null)).toBeNull();
	});

	test('feature/stack allowlists and unknown fallbacks', () => {
		const features = parseFeatures([
			{ icon: '⚡', title: 'A', description: 'D', coming: true, color: 'yellow' },
			{ icon: '🐳', title: 'B', description: 'D', color: 'aqua' },
			{ icon: '🔗', title: 'C', description: 'D', color: 'purple' },
			{ icon: 'x', title: 'D', description: 'D', color: 'toString' }
		]);
		expect(features[0].accent).toBe('yellow');
		expect(features[1].accent).toBe('aqua');
		expect(features[2].accent).toBeNull();
		expect(features[3].accent).toBeNull();
		const stack = parseStack([
			{ label: 'TS', type: 'lang' },
			{ label: 'DB', type: 'db' },
			{ label: 'X', type: 'script' },
			{ label: 'Y', type: 'toString' }
		]);
		expect(stack[0].type).toBe('lang');
		expect(stack[2].type).toBeNull();
		expect(stack[3].type).toBeNull();
	});

	test('URL validation: protocol and lookalike hosts rejected', () => {
		expect(isSafeGitHubUrl('https://github.com/MinePanelProject/minepanel-backend')).toBe(true);
		expect(isSafeGitHubUrl('http://github.com/foo')).toBe(false);
		expect(isSafeGitHubUrl('https://evilgithub.com/foo')).toBe(false);
		expect(isSafeGitHubUrl('https://github.com.evil.com/foo')).toBe(false);
		expect(isSafeGitHubUrl('https://notgithub.com/foo')).toBe(false);
		expect(isSafeGitHubUrl('javascript:alert(1)')).toBe(false);
		expect(isSafeGitHubUrl(12345)).toBe(false);
		expect(isValidUsername('okazakee')).toBe(true);
		expect(isValidUsername('bad user!')).toBe(false);
	});

	test('team contract: link + avatar only when both valid', () => {
		const team = parseTeam([
			{ name: 'A', username: 'okazakee', role: 'r', github: 'https://github.com/okazakee' },
			{ name: 'B', username: 'okazakee', role: 'r', github: 'https://evilgithub.com/x' },
			{ name: 'C', username: null, role: 'r', github: 'https://github.com/okazakee' },
			{ name: 'D', username: 'okazakee', role: 'r', github: null }
		]);
		expect(team[0].github).toBe('https://github.com/okazakee');
		expect(team[0].avatarSrc).toBe('https://github.com/okazakee.png?size=128');
		expect(team[1].github).toBeNull();
		expect(team[1].avatarSrc).toBeNull();
		expect(team[2].github).toBeNull();
		expect(team[2].avatarSrc).toBeNull();
		expect(team[3].github).toBeNull();
		expect(team[3].avatarSrc).toBeNull();
	});

	test('XSS payloads stay plain text in view models', () => {
		const features = parseFeatures([
			{ icon: '⚡', title: '<img src=x onerror=alert(1)>', description: '<script>alert(2)</script>', coming: false }
		]);
		expect(features[0].title).toBe('<img src=x onerror=alert(1)>');
		expect(features[0].description).toBe('<script>alert(2)</script>');
		const phases = parsePhases([
			{
				id: '1',
				label: '<b>x</b>',
				name: '"onmouseover"',
				status: 'planned',
				description: '& < > "',
				items: [{ text: '<svg onload=alert(1)>', done: false }]
			}
		]);
		expect(phases[0].label).toBe('<b>x</b>');
		expect(phases[0].items[0].text).toBe('<svg onload=alert(1)>');
		// full buildSiteData with a hostile backend keeps everything as data
		const data = buildSiteData({
			backend: {
				updatedAt: 'x',
				meta: { github: 'javascript:alert(1)' },
				features: [{ icon: '⚡', title: '<b>t</b>', description: 'd' }],
				techStack: [{ label: 'l', type: 'toString' }],
				team: [{ name: 'n', username: 'okazakee', role: 'r', github: 'https://github.com/okazakee' }],
				phases: []
			},
			frontend: null,
			mobile: null,
			repo: {},
			fallbackGithub: 'https://github.com/MinePanelProject'
		});
		expect(data.githubHref).toBe('https://github.com/MinePanelProject'); // javascript: rejected
		expect(data.features[0].title).toBe('<b>t</b>');
		expect(data.tracks[0].sourceNote).toBe('[ roadmap data unavailable ]');
	});
});
