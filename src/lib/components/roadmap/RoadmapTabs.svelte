<script lang="ts">
	import type { RoadmapTrack } from '$lib/data/types';

	let { tracks }: { tracks: RoadmapTrack[] } = $props();
</script>

<div class="roadmap-tabs" role="tablist" aria-label="Roadmap areas" aria-orientation="horizontal">
	{#each tracks as track, i}
		<button
			type="button"
			class="roadmap-tab"
			id="roadmap-tab-{track.key}"
			role="tab"
			aria-selected={i === 0}
			aria-controls="roadmap-panel-{track.key}"
			data-roadmap-track={track.key}
			data-source-note={track.sourceNote}
			tabindex={i === 0 ? 0 : -1}
		>
			<span class="roadmap-tab-name">{track.name}</span>
			<span class="roadmap-tab-subtitle">{track.subtitle}</span>
			<span class="roadmap-tab-state">{track.stateText}</span>
		</button>
	{/each}
</div>
