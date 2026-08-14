<script lang="ts">
	import type { PageData } from './$types';
	import Nav from '$lib/components/Nav.svelte';
	import TerrainStrip from '$lib/components/TerrainStrip.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Features from '$lib/components/Features.svelte';
	import TechStack from '$lib/components/TechStack.svelte';
	import QuickDeploy from '$lib/components/QuickDeploy.svelte';
	import Team from '$lib/components/Team.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import RoadmapExplorer from '$lib/components/roadmap/RoadmapExplorer.svelte';

	let { data }: { data: PageData } = $props();
</script>

<Nav stars={data.site.stars} />
<TerrainStrip variant="top" />
<Hero githubHref={data.site.githubHref} />

<hr class="pixel-divider" />

<div class="section" id="features">
	<p class="section-label">[ What it does ]</p>
	<h2 class="section-title">Core Features</h2>
	<Features features={data.site.features} />
</div>

<hr class="pixel-divider" />

<div class="section" id="stack">
	<p class="section-label">[ Built with ]</p>
	<h2 class="section-title">Tech Stack</h2>
	<TechStack stack={data.site.stack} />
	<QuickDeploy />
</div>

<hr class="pixel-divider" />

<div class="section" id="team">
	<p class="section-label">[ Who we are ]</p>
	<h2 class="section-title">Team</h2>
	<Team team={data.site.team} />
</div>

<hr class="pixel-divider" />
<TerrainStrip variant="transition" />

<RoadmapExplorer tracks={data.site.tracks} />

<TerrainStrip variant="bottom" />
<Footer />
