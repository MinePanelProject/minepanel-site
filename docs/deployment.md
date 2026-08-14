# Deployment (review-only — NOT activated)

This document describes the cutover for the migrated SvelteKit codebase on the existing
**Cloudflare Pages** project (`minepanel.xyz`). Nothing here has been applied. Switching
the Pages project root/build settings, installing the workflow, creating the deploy hook,
setting secrets, committing, pushing, or deploying **all require explicit owner approval**.

## Why this structure

`adapter-cloudflare` emits prerendered static assets plus a Pages worker. The current
landing route is fully prerendered (`prerender = true`), so it is served as a static asset
and never invokes the Pages function (`routes: { include: ['/*'], exclude: ['<all>'] }`
in `svelte.config.js`). Future routes can opt into on-demand SSR by setting
`prerender = false` in their route config and moving their path into `routes.include`.

## Cloudflare Pages settings (for the cutover)

- Git root directory: `migrated`
- Framework preset: `SvelteKit`
- Build command: `bun run build`
- Output directory: `.svelte-kit/cloudflare`
- Node build version: `22.12.x`
- Production branch: `main`
- Runtime compatibility flag: `nodejs_als` (already in `wrangler.jsonc`)

`wrangler.jsonc` contains no account IDs or secrets.

## Daily rebuild (scheduled refresh)

Cloudflare Pages supports Deploy Hooks for scheduled rebuilds and treats the hook URL as a
secret: <https://developers.cloudflare.com/pages/configuration/deploy-hooks/>. The
default refresh is a GitHub Actions scheduled workflow that POSTs to a `main`-branch
Deploy Hook. It does **not** checkout code, install dependencies, or build — it only
triggers a Pages build, so the workflow needs only `contents: read`.

Quota note: a daily schedule is ~31 builds/month, below the documented free Pages limit of
500 builds/month (<https://developers.cloudflare.com/pages/platform/limits/>). Confirm the
account plan before activating.

### Workflow (to add at `.github/workflows/daily-pages.yml` in the repo root, only after approval)

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

The secret `CLOUDFLARE_PAGES_DEPLOY_HOOK` must be created in the repo settings
(owner approval). It is an unauthenticated bearer secret: never commit it, echo it,
accept it from PR input, or expose it to preview code.

## Rollback / cutover checklist

1. Owner reviews the migration (run `bun run parity` locally; inspect
   `test-results/` screenshots).
2. Owner switches the Pages project settings per the table above (root, build command,
   output dir, Node version, compat flag).
3. Owner creates the Deploy Hook, adds the secret, and enables the scheduled workflow.
4. Push `main` with the migration in place (the old root `index.html` can be removed
   only after the new deployment is verified in production).
5. Verify: `https://minepanel.xyz/` renders identically; check
   `https://minepanel.xyz/_routes.json` shows no function routes; confirm the scheduled
   build fires daily.

## Future route-level SSR

- Add a route, e.g. `src/routes/docs/+page.ts` with `export const prerender = false;`.
- No adapter change needed: `routes.include` is already `['/*']`, and the
  `<all>` placeholder excludes only build artifacts, static files, and
  prerendered routes at build time. A non-prerendered route is therefore
  served by the Pages function automatically.
- Keep the landing route prerendered. The single `wrangler.jsonc` stays unchanged.
