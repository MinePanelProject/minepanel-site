<script lang="ts">
	import type { Phase as PhaseModel } from '$lib/data/types';

	let { phase, trackKey, index }: { phase: PhaseModel; trackKey: string; index: number } = $props();
	const bodyId = $derived(`tl-body-${trackKey}-${index}`);
</script>

<div class="tl-phase-block tl-item {phase.status}{phase.collapsed ? ' phase-collapsed' : ''}">
	<div class="tl-dot {phase.status}">{index + 1}</div>
	<button
		type="button"
		class="tl-phase-toggle tl-header"
		aria-expanded={!phase.collapsed}
		aria-controls={bodyId}
	>
		<span class="tl-phase">{phase.label}</span>
		<span class="tl-phase-name">{phase.name}</span>
		<span class="tl-badge {phase.status}">{phase.badge}</span>
		<span class="tl-phase-chevron" aria-hidden="true">▼</span>
	</button>
	<div class="tl-body" id={bodyId}>
		<p class="tl-desc">{phase.description}</p>
		<ul class="tl-list">
			{#each phase.items as item}
				<li class={item.done ? 'done' : ''}>{item.text}</li>
			{/each}
		</ul>
		{#if phase.progress !== null}
			<div class="progress-bar-wrap">
				<div class="progress-bar-fill" style="width:{phase.progress}%;"></div>
			</div>
			<p class="progress-label">{phase.progressLabel ?? `${phase.progress}% complete`}</p>
		{/if}
	</div>
</div>
