# MinePanel Site

Static-first [SvelteKit](https://svelte.dev/kit) site for [minepanel.xyz](https://minepanel.xyz) - the MinePanel marketing / landing page.

TypeScript, SvelteKit, and [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare). The site is fully prerendered: content is fetched, validated, and baked into static HTML at build time, so the landing page ships as static assets with no client-side data fetching or server runtime.

## Requirements

- [Bun](https://bun.sh) for installing and running scripts
- Node 22.12.x (see `.node-version` and `package.json#engines`)

## Commands

```bash
bun install            # install dependencies
bun run dev            # Vite dev server with HMR
bun run check          # svelte-check type checks
bun run build          # prerender into .svelte-kit/cloudflare
bun run pages:preview  # serve the build locally (wrangler pages dev)
bun run parity         # Playwright parity suite vs. the pre-migration site
```

## Structure

```
src/
  routes/
    +layout.ts         # ssr / prerender / csr page flags (prerender = true)
    +layout.svelte     # <head> metadata + global styles
    +page.server.ts    # loads site data once at build time
    +page.svelte       # composes the page sections
  lib/
    components/        # page sections: Nav, Hero, Features, TechStack,
                       # QuickDeploy, Team, Footer, roadmap/*
    data/              # endpoints, types, validation, fallbacks, load-site-data
    styles/            # design tokens + global CSS
static/                # favicon, og.png, logo-hero.png, icon-512.png, interactions.js
scripts/               # serve-reference.ts (reference server for the parity suite)
tests/                 # parity.spec.ts (Playwright parity tests)
docs/                  # deployment notes
```

## Content

All copy is fetched at build time by `+page.server.ts` → `loadSiteData()`, which pulls the content JSONs and the GitHub API in parallel, validates every field with type guards, and normalizes them into view models:

- [minepanel-site.json](https://github.com/MinePanelProject/minepanel-backend/blob/master/minepanel-site.json) (minepanel-backend)
- `roadmap.json` from [minepanel-frontend](https://github.com/MinePanelProject/minepanel-frontend) and [minepanel-mobile](https://github.com/MinePanelProject/minepanel-mobile)
- GitHub repo stats for the star counter

Each fetch is independent with a timeout; a failing source only degrades its own section. The only client-side JavaScript is `static/interactions.js` (mobile menu, roadmap tabs, phase collapse, copy button) - it manipulates already-rendered DOM, no fetching.

## Deployment

Hosted on **Cloudflare Pages**, Git-connected to this repo:

- production branch: `main`
- build command: `bun run build`
- output directory: `.svelte-kit/cloudflare`
- Node version: 22.12.x

Every push to `main` auto-deploys to production. Preview deployments are created for pull requests; rollbacks are available in the Cloudflare dashboard. The runtime compatibility flag `nodejs_als` is set in `wrangler.jsonc`.
