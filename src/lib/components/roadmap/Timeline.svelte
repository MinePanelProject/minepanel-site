<script lang="ts">
	import type { Phase as PhaseModel } from '$lib/data/types';
	import Phase from './Phase.svelte';

	let { trackKey, phases }: { trackKey: string; phases: PhaseModel[] } = $props();
</script>

{#each phases as phase, i}
	<Phase {phase} {trackKey} index={i} />
{/each}
