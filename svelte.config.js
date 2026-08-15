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
				// at build time. The landing page is served at runtime
				// (`prerender = false`, 12h edge cache), so the function
				// re-fetches site data automatically — no manual redeploys.
				include: ['/*'],
				exclude: ['<all>']
			}
		})
	}
};

export default config;
