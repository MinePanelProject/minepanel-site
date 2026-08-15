import { loadSiteData } from '$lib/data/load-site-data';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=43200, stale-while-revalidate=43200'
	});
	return { site: await loadSiteData() };
};
