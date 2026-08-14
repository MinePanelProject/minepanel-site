<script lang="ts">
	let { variant }: { variant: 'top' | 'transition' | 'bottom' } = $props();
</script>

{#if variant === 'top'}
	<div class="grass-strip"></div>
	<div class="dirt-strip"></div>
{:else if variant === 'transition'}
	<div class="dirt-strip" style="height:20px;"></div>
	<div class="grass-strip" style="transform:scaleY(-1);"></div>
{:else}
	<div class="grass-strip" style="transform:scaleY(-1);"></div>
	<div class="dirt-strip"></div>
	<div class="grass-strip"></div>
{/if}
