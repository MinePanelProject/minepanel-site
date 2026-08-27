<script lang="ts">
	import { page } from '$app/state';
	import { SITE_CONTENT } from '$lib/data/site-content';
	import '../lib/styles/tokens.css';
	import '../lib/styles/global.css';
	import '../lib/styles/primitives.css';
	import '../lib/styles/roadmap.css';
	import '../lib/styles/sections.css';

	let { children } = $props();
	const isPrivacy = $derived(page.url.pathname === '/privacy');
	const pageTitle = $derived(isPrivacy ? 'Privacy Notice - MinePanel' : SITE_CONTENT.metadata.title);
	const pageDescription = $derived(
		isPrivacy
			? 'Privacy notice for the MinePanel project website, including hosting, roadmap data, and third-party links.'
			: SITE_CONTENT.metadata.seoDescription
	);
	const canonicalUrl = $derived(`https://minepanel.xyz${isPrivacy ? '/privacy' : '/'}`);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="canonical" href={canonicalUrl} />
	<meta name="description" content={pageDescription} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content="https://minepanel.xyz/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content="https://minepanel.xyz/og.png" />
</svelte:head>

{@render children()}
