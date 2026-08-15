# Deployment

This document describes how the SvelteKit codebase is deployed to **Cloudflare Pages**
(`minepanel.xyz`). The cutover is **complete and live**: the migration was committed to
`main` and the Pages project was switched to the settings below.

## Why this structure

`adapter-cloudflare` emits prerendered static assets plus a Pages worker. The current
landing route is fully prerendered (`prerender = true`), so it is served as a static asset
and never invokes the Pages function (`routes: { include: ['/*'], exclude: ['<all>'] }`
in `svelte.config.js`). Future routes can opt into on-demand SSR by setting
`prerender = false` in their route config and moving their path into `routes.include`.

## Cloudflare Pages settings (current)

- Git root directory: `` (repo root — codebase lives at the root)
- Framework preset: `SvelteKit`
- Build command: `bun run build`
- Output directory: `.svelte-kit/cloudflare`
- Node build version: `22.12.x`
- Production branch: `main`
- Runtime compatibility flag: `nodejs_als` (already in `wrangler.jsonc`)

`wrangler.jsonc` contains no account IDs or secrets.

## Deploy flow

Pushes to `main` trigger an automatic Cloudflare Pages build via the GitHub
integration (verified: deploy stages queued → initialize → clone_repo → build → deploy).

## Daily rebuild (optional, not activated)

Cloudflare Pages supports Deploy Hooks for scheduled rebuilds and treats the hook URL as a
secret: <https://developers.cloudflare.com/pages/configuration/deploy-hooks/>. A GitHub
Actions scheduled workflow POSTs to a `main`-branch Deploy Hook. It does **not** checkout
code, install dependencies, or build — it only triggers a Pages build, so the workflow
needs only `contents: read`.

Quota note: a daily schedule is ~31 builds/month, below the documented free Pages limit of
500 builds/month (<https://developers.cloudflare.com/pages/platform/limits/>).

### Workflow (add at `.github/workflows/daily-pages.yml` if the scheduled refresh is wanted)

```yaml
name: daily-pages-rebuild
on:
  schedule:
    - cron: '17 3 * * *' # 03:17 UTC daily
  workflow_dispatch: {}

permissions:
  contents: read

concurrency:
  group: pages-rebuild
  cancel-in-progress: false

jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare Pages deploy hook
        run: |
          curl -fsS -X POST \
            -H 'Content-Type: application/json' \
            -d '{}' \
            "${{ secrets.CLOUDFLARE_PAGES_DEPLOY_HOOK }}"
```

The secret `CLOUDFLARE_PAGES_DEPLOY_HOOK` must be created in the repo settings. It is an
unauthenticated bearer secret: never commit it, echo it, accept it from PR input, or
expose it to preview code.

## Verification

- `https://minepanel.xyz/` renders the SvelteKit build (check for `_app/immutable` in the
  HTML).
- `https://minepanel.xyz/_routes.json` shows no function routes (all prerendered).
- Pages dashboard → project `minepanel` → Deployments shows the latest `main` build
  succeeded.

## Future route-level SSR

- Add a route, e.g. `src/routes/docs/+page.ts` with `export const prerender = false;`.
- No adapter change needed: `routes.include` is already `['/*']`, and the
  `<all>` placeholder excludes only build artifacts, static files, and
  prerendered routes at build time. A non-prerendered route is therefore
  served by the Pages function automatically.
- Keep the landing route prerendered. The single `wrangler.jsonc` stays unchanged.
