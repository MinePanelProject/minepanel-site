# MinePanel Site

Static landing page for [minepanel.xyz](https://minepanel.xyz) — the MinePanel coming-soon / marketing site.

Plain HTML/CSS/JS in a single file. No framework, no build step.

## Structure

```
index.html    # the whole site: markup, styles, and script
favicon.svg   # browser tab icon
og.png        # OpenGraph/social share image
```

## Local preview

Just open the file:

```bash
# static server (any is fine)
python3 -m http.server 8080
# then visit http://localhost:8080
```

No `npm install`, no build command.

## Deployment

Hosted on **Cloudflare Pages**, Git-connected to this repo:

- production branch: `main`
- build command: none
- output directory: `/`

Every push to `main` auto-deploys to production. Preview deployments are created for pull requests; rollbacks are available in the Cloudflare dashboard.

## Content data

The site's copy is tracked separately in [minepanel-backend/minepanel-site.json](https://github.com/MinePanelProject/minepanel-backend/blob/master/minepanel-site.json). If the page starts being generated from that file, the build step moves into CI here — until then, edits are direct.
