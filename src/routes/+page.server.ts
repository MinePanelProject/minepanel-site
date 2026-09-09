import { loadSiteData } from '$lib/data/load-site-data';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		// rendered HTML is build-owned copy: every request revalidates against
		// the origin so a fresh deployment becomes visible immediately
		'cache-control': 'no-cache, must-revalidate'
	});
	return { site: await loadSiteData() };
};
