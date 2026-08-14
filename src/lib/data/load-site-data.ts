import { BACKEND_URL, DEFAULT_GITHUB_ORG_URL, FRONTEND_URL, GITHUB_REPO_URL, MOBILE_URL } from './endpoints';
import { buildSiteData } from './validate';
import type { SiteData } from './types';

const FETCH_TIMEOUT_MS = 8000;
const HEADERS = { Accept: 'application/vnd.github+json' };

async function fetchJson(url: string): Promise<unknown | null> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Fetch and normalize all site content at build/prerender time.
 * Every endpoint is independent: a failure only degrades its own section.
 */
export async function loadSiteData(): Promise<SiteData> {
	const [backend, frontend, mobile, repo] = await Promise.all([
		fetchJson(BACKEND_URL),
		fetchJson(FRONTEND_URL),
		fetchJson(MOBILE_URL),
		fetchJson(GITHUB_REPO_URL)
	]);

	return buildSiteData({ backend, frontend, mobile, repo, fallbackGithub: DEFAULT_GITHUB_ORG_URL });
}
