import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	timeout: 120000,
	fullyParallel: false,
	retries: 0,
	reporter: [['list']],
	use: {
		trace: 'retain-on-failure'
	},
	webServer: [
		{
			command: 'bun run scripts/serve-reference.ts',
			url: 'http://127.0.0.1:8099/',
			reuseExistingServer: true,
			timeout: 30000
		},
		{
			command: 'bunx wrangler pages dev .svelte-kit/cloudflare --port 8788',
			url: 'http://127.0.0.1:8788/',
			reuseExistingServer: true,
			timeout: 60000
		}
	],
	projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
});
