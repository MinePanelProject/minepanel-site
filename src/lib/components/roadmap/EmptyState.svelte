<script lang="ts">
	let { title, copy }: { title: string; copy: string } = $props();
</script>

<div class="tbd-block" role="note">
	<span class="tbd-glyph" aria-hidden="true">?</span>
	<p class="tbd-title">{title}</p>
	{#if copy}<p class="tbd-copy">{copy}</p>{/if}
</div>
