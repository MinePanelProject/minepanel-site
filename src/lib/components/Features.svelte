<script lang="ts">
	import type { Feature } from '$lib/data/types';

	let { features }: { features: Feature[] } = $props();
	const current = $derived(features.filter((f) => !f.coming));
	const coming = $derived(features.filter((f) => f.coming));
	const accentVar = (a: Feature['accent'], fallback: string) => `var(--${a ?? fallback})`;
</script>

<div id="features-grid" class="features-grid">
	{#each current as f}
		<div class="feature-card mc-panel" style="border-left-color:{accentVar(f.accent, 'border')};">
			<span class="icon">{f.icon}</span>
			<h3 style="color:{accentVar(f.accent, 'green')};">{f.title}</h3>
			<p>{f.description}</p>
		</div>
	{/each}
	{#if coming.length > 0}
		<div class="features-coming-label">[ Future phases ]</div>
		{#each coming as f}
			<div
				class="feature-card mc-panel coming"
				style="border-left-color:{accentVar(f.accent, 'border')};border-left-style:dashed;"
			>
				<span class="icon">{f.icon}</span>
				<h3 style="color:{accentVar(f.accent, 'green')};">{f.title}</h3>
				<p>{f.description}</p>
			</div>
		{/each}
	{/if}
</div>
