<script lang="ts">
	import { page } from '$app/state';
	import { SITE_CONTENT, SITE_URL } from '$lib/data/site-content';
	import { STRUCTURED_DATA } from '$lib/data/structured-data';
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
	const canonicalUrl = $derived(`${SITE_URL}${isPrivacy ? '/privacy' : '/'}`);
	const structuredDataJson = JSON.stringify(STRUCTURED_DATA);
	// Keep the closing tag split so Svelte does not parse it as this component's script.
	const structuredDataTag =
		'<script type="application/ld+json">' + structuredDataJson + '</scr' + 'ipt>';
</script>

<svelte:head>
	<link rel="describedby" href="/llms.txt" type="text/markdown" />
	<title>{pageTitle}</title>
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="canonical" href={canonicalUrl} />
	<meta name="description" content={pageDescription} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={`${SITE_URL}/og.png`} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={`${SITE_URL}/og.png`} />
	{@html structuredDataTag}
</svelte:head>

{@render children()}
