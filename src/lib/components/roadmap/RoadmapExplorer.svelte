<script lang="ts">
	import type { RoadmapTrack } from '$lib/data/types';
	import RoadmapTabs from './RoadmapTabs.svelte';
	import StatusKey from './StatusKey.svelte';
	import Timeline from './Timeline.svelte';
	import EmptyState from './EmptyState.svelte';

	let { tracks }: { tracks: RoadmapTrack[] } = $props();
	const backend = $derived(tracks.find((t) => t.key === 'backend'));
</script>

<div class="section" id="roadmap">
	<p class="section-label">[ Development Progress ]</p>
	<h2 class="section-title">Roadmap</h2>

	<div class="roadmap-explorer">
		<RoadmapTabs {tracks} />

		<div class="roadmap-stage mc-panel">
			<StatusKey />

			{#each tracks as track, i}
				<div
					class="roadmap-panel"
					id="roadmap-panel-{track.key}"
					role="tabpanel"
					aria-labelledby="roadmap-tab-{track.key}"
					tabindex="0"
					hidden={i !== 0}
				>
					<p class="roadmap-repo-label">{track.repoLabel}</p>
					<div id="timeline-{track.key}" class="timeline">
						{#if track.phases}
							<Timeline trackKey={track.key} phases={track.phases} />
						{:else}
							<EmptyState title={track.emptyTitle} copy={track.emptyCopy} />
						{/if}
					</div>
				</div>
			{/each}

			<p class="roadmap-source" id="data-source" aria-live="polite">{backend?.sourceNote ?? ''}</p>
		</div>
	</div>
</div>
