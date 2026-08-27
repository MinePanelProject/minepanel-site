<script lang="ts">
	import { SITE_CONTENT } from '$lib/data/site-content';

	let { githubHref }: { githubHref: string } = $props();
	const deployHref = 'https://github.com/MinePanelProject/minepanel-backend#quick-deploy';
	const webAppHref = 'https://app.minepanel.xyz';
</script>

<section class="hero" id="about">
	<div class="hero-title">
		<img class="hero-mark" src="/logo-hero.png" width="256" height="256" alt="" />
		<h1>Mine<span>Panel</span></h1>
	</div>
	<p class="tagline">{SITE_CONTENT.metadata.tagline}</p>
	<p class="subtitle">
		{SITE_CONTENT.metadata.heroDescription.before}<code
			style="color:var(--green);background:#0d1f0d;padding:2px 6px;"
			>{SITE_CONTENT.metadata.heroDescription.command}</code
		>{SITE_CONTENT.metadata.heroDescription.after}
	</p>
	<div class="cta-row">
		<a class="btn btn-primary" href={deployHref} target="_blank" rel="noopener">
			<svg
				class="rt-icon"
				viewBox="0 0 16 16"
				width="16"
				height="16"
				aria-hidden="true"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="square"
				stroke-linejoin="miter"
				><path d="M2 8h12M9 3l5 5-5 5" /></svg
			>
			Get Started
		</a>
		<a class="btn btn-secondary" href={webAppHref} target="_blank" rel="noopener">
			<svg
				class="rt-icon"
				viewBox="0 0 16 16"
				width="16"
				height="16"
				aria-hidden="true"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="square"
				stroke-linejoin="miter"
				><rect x="2" y="2" width="12" height="9" /><path d="M5 14h6M8 11v3" /></svg
			>
			Open Web App
		</a>
	</div>
	<p class="hero-app-note">Hosted dashboard for your self-hosted MinePanel instance.</p>
	<div class="hero-links">
		<a href={githubHref} target="_blank" rel="noopener">Source Code</a>
		<a href="#roadmap">Roadmap</a>
	</div>
	<a class="scroll-hint" href="#status" aria-label="Scroll down to project status">
		<svg viewBox="0 0 16 16" width="36" height="36" aria-hidden="true" fill="currentColor">
			<rect x="7" y="0" width="2" height="6" />
			<rect x="4" y="6" width="8" height="2" />
			<rect x="5" y="8" width="6" height="2" />
			<rect x="6" y="10" width="4" height="2" />
			<rect x="7" y="12" width="2" height="2" />
		</svg>
	</a>
</section>

