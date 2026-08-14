<script lang="ts">
	import '../lib/styles/tokens.css';
	import '../lib/styles/global.css';
	import '../lib/styles/primitives.css';
	import '../lib/styles/roadmap.css';
	import '../lib/styles/sections.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>MinePanel - Self-Hosted Minecraft Server Manager</title>
	<link rel="icon" type="image/png" href="/favicon.png" />
	<meta
		name="description"
		content="Self-hosted Minecraft server management panel. One docker compose up brings up the entire stack on your own machine. No cloud lock-in. Full control."
	/>

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://minepanel.xyz" />
	<meta property="og:title" content="MinePanel - Self-Hosted Minecraft Server Manager" />
	<meta
		property="og:description"
		content="Self-hosted Minecraft server management panel. One docker compose up brings up the entire stack on your own machine. No cloud lock-in. Full control."
	/>
	<meta property="og:image" content="https://minepanel.xyz/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="MinePanel - Self-Hosted Minecraft Server Manager" />
	<meta
		name="twitter:description"
		content="Self-hosted Minecraft server management panel. One docker compose up brings up the entire stack on your own machine. No cloud lock-in. Full control."
	/>
	<meta name="twitter:image" content="https://minepanel.xyz/og.png" />

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}
