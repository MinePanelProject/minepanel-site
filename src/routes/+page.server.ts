import { loadSiteData } from '$lib/data/load-site-data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Runs once at build/prerender time; no client-side data fetching.
	return { site: await loadSiteData() };
};
