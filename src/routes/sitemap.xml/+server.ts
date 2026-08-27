import { response } from 'super-sitemap/sveltekit';
import type { RequestHandler } from '@sveltejs/kit';
import { SITE_URL } from '$lib/data/site-content';

export const prerender = true;

export const GET: RequestHandler = async () =>
	response({
		origin: SITE_URL
	});
