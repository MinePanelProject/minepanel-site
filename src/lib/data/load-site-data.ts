import { BACKEND_URL, FRONTEND_URL, MOBILE_URL } from './endpoints';
import { buildSiteData } from './validate';
import type { SiteData } from './types';

const FETCH_TIMEOUT_MS = 8000;
const HEADERS = { Accept: 'application/vnd.github+json' };

/**
 * Cloudflare `fetch` extension (`cf`): the standard `RequestInit` type does not
 * model it, so the loader pins the extension to this local subtype. `fetch`
 * accepts it because the interface extends `RequestInit`.
 */
interface CfCacheRequestInit extends RequestInit {
	cf?: {
		cacheEverything: true;
		cacheTtlByStatus: Record<string, number>;
	};
}

const ROADMAP_FETCH_INIT: CfCacheRequestInit = {
	cf: {
		cacheEverything: true,
		// subrequest cache TTLs: 2xx 10 minutes, 404 60 s; 5xx is never cached
		// so origin failures keep being retried instead of served stale
		cacheTtlByStatus: {
			'200-299': 600,
			'404': 60,
			'500-599': 0
		}
	}
};

async function fetchJson(url: string): Promise<unknown | null> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			...ROADMAP_FETCH_INIT,
			headers: HEADERS,
			signal: controller.signal
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Fetch and normalize all site content at request time in the Cloudflare runtime.
 * Every endpoint is independent: a failure only degrades its own section.
 */
export async function loadSiteData(): Promise<SiteData> {
	const [backend, frontend, mobile] = await Promise.all([
		fetchJson(BACKEND_URL),
		fetchJson(FRONTEND_URL),
		fetchJson(MOBILE_URL)
	]);

	return buildSiteData({ backend, frontend, mobile });
}
