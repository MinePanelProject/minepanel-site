<script lang="ts">
	import type { StackEntry } from '$lib/data/types';

	let { stack }: { stack: StackEntry[] } = $props();
</script>

<div id="stack-grid" class="stack-grid">
	{#each stack as t}
		<span class="stack-pill {t.type ?? ''}">{t.label}</span>
	{/each}
</div>
