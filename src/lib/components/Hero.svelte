<script lang="ts">
	let { githubHref }: { githubHref: string } = $props();
</script>

<section class="hero" id="about">
	<div class="hero-title">
		<img class="hero-mark" src="/logo-hero.png" width="256" height="256" alt="" />
		<h1>Mine<span>Panel</span></h1>
	</div>
	<p class="tagline">Self-hosted Minecraft server management, the right way.</p>
	<p class="subtitle">
		A single <code style="color:var(--green);background:#0d1f0d;padding:2px 6px;">docker-compose up</code>
		brings up the entire stack on your own machine.
		No external services. No cloud lock-in. Full control.
	</p>
	<div class="cta-row">
		<a class="btn btn-primary" href="#roadmap">
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
				><circle cx="2.5" cy="13" r="1" fill="currentColor" stroke="none" /><path d="M2.5 12V8.5l4 1.5 4-3V3.5" /><circle
					cx="10.5"
					cy="3.5"
					r="1"
					fill="currentColor"
					stroke="none"
				/></svg
			>
			View Roadmap
		</a>
		<a class="btn btn-secondary" href={githubHref} target="_blank" rel="noopener">
			<svg
				class="gh-icon"
				viewBox="0 0 16 16"
				width="16"
				height="16"
				aria-hidden="true"
				fill="currentColor"
				><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg
			>
			Source Code
		</a>
	</div>
</section>
