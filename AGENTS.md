# AGENTS.md — MinePanel Site

## 1. Overview

This repository is the public marketing site for MinePanel, served at `https://minepanel.xyz` by
Cloudflare Pages through `@sveltejs/adapter-cloudflare`. It is presentation plus one runtime data
load. It is **not** the dashboard (`minepanel-pwa`) and it contains no backend, no authentication and
no user data.

Read these before changing anything:

| Question | File |
|----------|------|
| What is this repository for, and how is it deployed? | [`README.md`](./README.md), [`docs/deployment.md`](./docs/deployment.md) |
| What do the implementation repositories currently do? | [`minepanel-backend/SPEC.md`](https://github.com/MinePanelProject/minepanel-backend/blob/master/SPEC.md), [`minepanel-pwa/SPEC.md`](https://github.com/MinePanelProject/minepanel-pwa/blob/master/SPEC.md) |
| What is actually shipped vs planned? | the roadmap files published by those repositories |

## 2. Structure and ownership rules

```text
src/routes/        +layout.{ts,svelte}, +page.server.ts, +page.svelte, privacy/
src/lib/components/  Nav, Hero, ProjectStatus, Features, TechStack, QuickDeploy, Team, Footer, roadmap/
src/lib/data/        site-content.ts (local typed copy), endpoints.ts, validate.ts, load-site-data.ts
src/lib/styles/      design tokens and global CSS
static/              fonts, robots.txt, sitemap.xml, llms.txt, images, interactions.js
tests/               Playwright behavior, accessibility, asset and data-layer suite
docs/                deployment notes
```

* **Presentation content is owned here** in `src/lib/data/site-content.ts` (typed, local). Changing copy
  requires a site deployment.
* **Implementation progress is owned elsewhere.** Only `roadmap.json` files are fetched, at request
  time, in the Cloudflare runtime — never from the browser. A roadmap update must never require a site
  deployment, and this repository must never restate implementation status in its own copy.
* **A `roadmap.json` is the published projection of the owning repository's `ROADMAP.md`.** When copy
  in this repository describes what is shipped, verify it against the owning repository's `SPEC.md`
  and code — never against the roadmap's presence alone, since a roadmap records intent, not current
  behavior. If the two disagree, report the discrepancy; the implementation repository resolves it.

## 3. Commands

```bash
bun install
bun run dev            # Vite dev server
bun run check          # svelte-check (must stay at 0 errors/warnings)
bun run build          # Cloudflare Pages output in .svelte-kit/cloudflare
bun run parity         # Playwright behavior + data-layer suite (spawns wrangler pages dev on :8788)
bun run pages:preview  # serve the build locally
```

Run `bun run check`, `bun run build` and `bun run parity` before claiming a change is done. The parity
suite asserts specific public copy, links, `llms.txt` contents and roadmap data-layer behaviour;
changing those strings intentionally means updating the assertions in the same change.

Node is pinned by `.node-version` and `package.json#engines` (22.12.x).

## 4. Red Lines

- **Never fetch site content from the browser.** Homepage data is fetched server-side in the
  Cloudflare runtime with a per-source timeout; a failed source must degrade only its own section.
- **Never add client-side tracking, analytics, advertising, contact forms or non-essential cookies**,
  and never use `localStorage`/`sessionStorage`. The privacy notice describes the actual processing
  surface; if the surface changes, the notice and `/privacy` copy change with it.
- **Never add a remote font, script or asset host** without a documented reason; fonts are self-hosted
  from `static/fonts/` under the SIL Open Font License, and team avatars are the only intentionally
  remote images (GitHub's avatar service).
- **Never claim unshipped behaviour as shipped**, and never soften a limitation into a promise. If a
  capability is exploratory, say so or omit it; if it is committed, it must match the owning
  repository's `ROADMAP.md`.
- **Never use `docker-compose` (v1) in copy or commands** — the shipped deployment uses
  `docker compose` (v2); the file name `docker-compose.yml` is the only hyphenated form.
- **Never publish an unverified roadmap fact** by editing `roadmap.json` here: that file belongs to the
  implementation repository. Editing it in this repository has no effect on the live site.
- **Never commit secrets or account identifiers.** `wrangler.jsonc` must stay free of account IDs and
  secrets.
- **Never let the site imply MinePanel hosts Minecraft servers.** It is self-hosted software; the
  dashboard is a client for operator-run backends.
