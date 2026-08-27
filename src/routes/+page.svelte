<script lang="ts">
	import type { PageData } from './$types';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import Features from '$lib/components/Features.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import ProjectStatus from '$lib/components/ProjectStatus.svelte';
	import QuickDeploy from '$lib/components/QuickDeploy.svelte';
	import RoadmapExplorer from '$lib/components/roadmap/RoadmapExplorer.svelte';
	import Team from '$lib/components/Team.svelte';
	import TechStack from '$lib/components/TechStack.svelte';
	import TerrainStrip from '$lib/components/TerrainStrip.svelte';

	let { data }: { data: PageData } = $props();
</script>

<Nav />
<Hero githubHref={data.site.githubHref} />

<TerrainStrip variant="transition" />
<ProjectStatus />

<TerrainStrip variant="transition" />

<div class="section" id="features">
	<p class="section-label">[ What it does ]</p>
	<h2 class="section-title">Core Features</h2>
	<Features features={data.site.features} />
</div>

<TerrainStrip variant="transition" />

<div class="section" id="stack">
	<p class="section-label">[ Built with ]</p>
	<h2 class="section-title">Tech Stack</h2>
	<TechStack stack={data.site.stack} />
	<QuickDeploy />
</div>

<TerrainStrip variant="transition" />

<div class="section" id="team">
	<p class="section-label">[ Who we are ]</p>
	<h2 class="section-title">Team</h2>
	<Team team={data.site.team} />
</div>
<TerrainStrip variant="transition" />

<RoadmapExplorer tracks={data.site.tracks} />

<Footer githubHref={data.site.githubHref} />

<BackToTop />

