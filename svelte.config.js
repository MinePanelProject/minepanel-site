import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			config: 'wrangler.jsonc',
			routes: {
				// All routes match the function (include: ['/*']); `<all>`
				// excludes build artifacts, static files, and prerendered routes
				// at build time. Future `prerender = false` routes are therefore
				// served by the Pages function automatically — no config change.
				include: ['/*'],
				exclude: ['<all>']
			}
		})
	}
};

export default config;
