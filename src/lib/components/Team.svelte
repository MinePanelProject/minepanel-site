<script lang="ts">
	import type { TeamMember } from '$lib/data/types';

	let { team }: { team: TeamMember[] } = $props();
</script>

<div id="team-roster" class="team-roster">
	{#each team as m}
		{#if m.github}
			<a class="team-block" href={m.github} target="_blank" rel="noopener">
				{#if m.avatarSrc}
					<img class="team-block-avatar" src={m.avatarSrc} alt="" loading="lazy" />
				{:else}
					<span class="team-block-avatar team-block-avatar--placeholder">?</span>
				{/if}
				<span class="team-block-info">
					<span class="team-block-name"
						>{m.name}{#if m.username}<span class="team-username">(@{m.username})</span>{/if}</span
					>
					<span class="team-block-role">{m.role}</span>
				</span>
			</a>
		{:else}
			<div class="team-block team-block--dummy">
				{#if m.avatarSrc}
					<img class="team-block-avatar" src={m.avatarSrc} alt="" loading="lazy" />
				{:else}
					<span class="team-block-avatar team-block-avatar--placeholder">?</span>
				{/if}
				<span class="team-block-info">
					<span class="team-block-name"
						>{m.name}{#if m.username}<span class="team-username">(@{m.username})</span>{/if}</span
					>
					<span class="team-block-role">{m.role}</span>
				</span>
			</div>
		{/if}
	{/each}
</div>
