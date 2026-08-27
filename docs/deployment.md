# Deployment

This document describes how the SvelteKit codebase is deployed to **Cloudflare Pages** at
[`minepanel.xyz`](https://minepanel.xyz).

## Current architecture

`adapter-cloudflare` emits static assets plus a Pages Worker. The root layout keeps SSR enabled,
CSR disabled, and prerendering enabled by default. The homepage opts out with
`src/routes/+page.server.ts` (`prerender = false`) because it loads validated roadmap/content JSON
at request time and sets a 12-hour public cache with stale-while-revalidate. The `/privacy` route
uses the default prerender behavior.

The homepage loader fetches the public content sources from GitHub raw-content endpoints in the
Cloudflare runtime. Failures are isolated and fall back to the validated empty roadmap states.
These requests are server-side; the browser does not call GitHub APIs. Normal page loads use
same-origin JavaScript, CSS, local assets, and locally hosted fonts, plus the intentionally remote
GitHub team avatar images.

## Cloudflare Pages settings

- Git root directory: `` (repository root)
- Framework preset: `SvelteKit`
- Build command: `bun run build`
- Output directory: `.svelte-kit/cloudflare`
- Node build version: `22.12.x`
- Production branch: `main`
- Runtime compatibility flag: `nodejs_als` in `wrangler.jsonc`

`wrangler.jsonc` contains no account IDs or secrets.

## Deploy flow

Pushes to `main` trigger a Cloudflare Pages build through the GitHub integration. Preview
deployments are created for pull requests; rollbacks are available in the Cloudflare dashboard.

## Content sources

The homepage reads and validates:

- `minepanel-site.json` from `minepanel-backend`
- `roadmap.json` from `minepanel-pwa`
- the mobile roadmap endpoint when published

The content source is cached by the homepage response headers for 12 hours. A redeploy is not
required for every content refresh, although the Cloudflare cache may serve stale content during
stale-while-revalidate.

## Verification

- `https://minepanel.xyz/` renders the SvelteKit homepage.
- `https://minepanel.xyz/privacy` renders the prerendered Privacy Notice.
- `https://minepanel.xyz/robots.txt` permits normal indexing.
- `bun run check` validates the Svelte and TypeScript source.
- `bun run build` produces `.svelte-kit/cloudflare`.
- `bun run parity` runs the Playwright behavior, accessibility, responsive, asset, and data-layer suite.

The homepage does not claim zero platform-level data collection. Cloudflare may process request and
security logs, and GitHub may process the runtime's public-content requests. See `/privacy` for the
scope and limits of the site's data processing.
