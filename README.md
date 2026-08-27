# MinePanel Site

SvelteKit site for [minepanel.xyz](https://minepanel.xyz), the public landing page for MinePanel: a self-hosted Minecraft server management panel.

The site uses TypeScript, SvelteKit, and [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare). It is served by Cloudflare Pages with a Pages Worker for the runtime landing route. The homepage is intentionally not fully prerendered: its server loader fetches and validates current project content and roadmap data, then caches the response at the edge for 12 hours. The `/privacy` route is prerendered.

## Requirements

- [Bun](https://bun.sh) for installing and running scripts
- Node 22.12.x (see `.node-version` and `package.json#engines`)

## Commands

```bash
bun install            # install dependencies
bun run dev            # Vite dev server with HMR
bun run check          # svelte-check type checks
bun run build          # build the Cloudflare Pages output
bun run pages:preview  # serve the build locally (wrangler pages dev)
bun run parity         # Playwright behavior and accessibility suite
```

## Structure

```
src/
  routes/
    +layout.ts         # shared SSR/prerender/CSR flags
    +layout.svelte     # metadata, canonical URLs, and global styles
    +page.server.ts    # runtime homepage data loader and edge cache headers
    +page.svelte       # homepage section composition
    privacy/            # prerendered Privacy Notice route
  lib/
    components/        # page sections: Nav, Hero, ProjectStatus, Features,
                       # TechStack, QuickDeploy, Team, Footer, roadmap/*
    data/              # endpoints, types, validation, fallbacks, data loader
    styles/             # design tokens + global CSS
static/
  fonts/               # locally hosted Press Start 2P and VT323 WOFF2 files
  robots.txt
  favicon.png, og.png, logo-hero.png, icon-512.png
  interactions.js      # framework-independent browser interactions
tests/                 # Playwright behavior and data-layer tests
docs/                  # deployment notes
```

## Content and data loading

`src/routes/+page.server.ts` calls `loadSiteData()` at runtime. The loader fetches public JSON from GitHub raw-content endpoints in parallel:

- [`minepanel-site.json`](https://github.com/MinePanelProject/minepanel-backend/blob/master/minepanel-site.json) from `minepanel-backend`
- [`roadmap.json`](https://github.com/MinePanelProject/minepanel-pwa/blob/master/roadmap.json) from `minepanel-pwa`
- the mobile roadmap endpoint when that repository publishes one

Each request has an independent timeout and is validated before it reaches the components. Missing or invalid sources degrade only their own roadmap section. These are server-side Cloudflare/runtime requests; the browser does not fetch GitHub APIs or roadmap JSON. The site has no star counter, analytics, or client-side content fetch.

## Privacy and browser dependencies

The site has no advertising, profiling, behavioral analytics, marketing tracking, contact form, or non-essential cookie. It does not use `localStorage` or `sessionStorage`. The project fonts are served from `static/fonts/` under the SIL Open Font License, so normal homepage loads do not request Google Fonts. Team avatars remain dynamically loaded from GitHub's avatar service, which is documented in [`/privacy`](https://minepanel.xyz/privacy) together with Cloudflare platform logging, server-side GitHub content retrieval, and external links.

## Deployment

Hosted on **Cloudflare Pages**, connected to this repository:

- production branch: `main`
- build command: `bun run build`
- output directory: `.svelte-kit/cloudflare`
- Node version: 22.12.x

`svelte.config.js` routes requests through the Cloudflare adapter. The homepage opts into runtime rendering with `prerender = false` and sends a 12-hour public cache plus stale-while-revalidate headers. Static assets and `/privacy` remain prerendered. `wrangler.jsonc` contains the `nodejs_als` compatibility flag and no account IDs or secrets.

## Related projects

- [`minepanel-backend`](https://github.com/MinePanelProject/minepanel-backend): self-hosted NestJS API, PostgreSQL, Caddy, Docker orchestration, authentication, and server lifecycle
- [`minepanel-pwa`](https://github.com/MinePanelProject/minepanel-pwa): hosted dashboard client for operator-selected self-hosted backends at [app.minepanel.xyz](https://app.minepanel.xyz)
