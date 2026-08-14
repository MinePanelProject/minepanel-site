# MinePanel Site — migrated codebase

Static-first SvelteKit migration of the single-file landing page. Rendered output is
**pixel-identical** to the current root `index.html`; all content is fetched and rendered
at **build time** (no client-side data loading). The old site at the repo root remains the
production source of truth until this migration is reviewed and cut over.

## Framework decision

- **SvelteKit** with **`@sveltejs/adapter-cloudflare`** (current stable), TypeScript, Vite underneath.
- Why not bare Vite? Vite alone is a bundler/dev server — treating this as a Vite SPA would
  add client-side rendering and violate the build-time content requirement.
- Why not Astro? Astro would otherwise be the best zero-JS static-first choice, but the
  requirement is **future SSR on Cloudflare Pages**. Current `@astrojs/cloudflare` (v13+)
  removed Cloudflare Pages support and targets Workers only; keeping Pages SSR would mean
  pinning an obsolete Astro 5/adapter 12 stack, creating immediate version debt.
  See <https://docs.astro.build/en/guides/integrations-guide/cloudflare/#removed-cloudflare-pages-support>.
- SvelteKit's official adapter supports both Cloudflare Pages and Workers, produces
  prerendered routes plus a Pages worker for future dynamic routes, and supports
  route-level `prerender` overrides.
  See <https://svelte.dev/docs/kit/adapter-cloudflare> and <https://svelte.dev/docs/kit/page-options>.

The landing route is configured in `src/routes/+layout.ts` with
`ssr = true`, `prerender = true`, `csr = false` — emitted as static HTML, no client runtime.
The only client JavaScript is `static/interactions.js` (mobile menu, roadmap tabs,
phase collapse, copy button) — it manipulates already-rendered DOM only, no fetching.

## Requirements

- Bun (install/scripts) and Node 22.12.x (see `.node-version` and `package.json#engines`).
- Nothing is installed globally.

## Commands

```bash
bun install
bun run check          # svelte-check, zero errors expected
bun run build          # prerender into .svelte-kit/cloudflare
bun run pages:preview  # wrangler pages dev .svelte-kit/cloudflare (local Pages output)
bun run parity         # playwright pixel/interaction parity vs root index.html
```

## Architecture

```
src/
  routes/
    +layout.ts         # ssr/prerender/csr flags
    +layout.svelte     # head metadata + global styles
    +page.server.ts    # loads site data once at build time
    +page.svelte       # composes sections
  lib/
    components/        # Nav, Hero, Features, TechStack, QuickDeploy, Team, Footer,
                       # roadmap/* (RoadmapExplorer, RoadmapTabs, StatusKey, Timeline,
                       # Phase, EmptyState), TerrainStrip
    data/              # endpoints, types, validate (type guards + allowlists),
                       # normalize, fallbacks (exact empty-state copy), load-site-data
    styles/            # tokens.css, global.css, primitives.css, roadmap.css
static/                # favicon.png, logo-hero.png, icon-512.png, og.png, interactions.js
```

Data flow: `+page.server.ts` → `loadSiteData()` fetches the three roadmap/content JSONs and
the GitHub API in parallel (`Promise.allSettled`-style, 8s abort timeout), validates every
field with type guards, normalizes into safe view models, and passes them to components.
Components render only through Svelte text/attribute interpolation (no `{@html}`,
no `innerHTML`) — the old `esc()` security property is preserved by the framework.

See `docs/deployment.md` for the review-only Cloudflare Pages cutover plan.
