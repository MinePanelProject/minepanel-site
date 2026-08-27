<script lang="ts">
	let { githubHref }: { githubHref: string } = $props();
	const getStartedHref = 'https://github.com/MinePanelProject/minepanel-backend#quick-deploy';
	const webAppHref = 'https://app.minepanel.xyz';
</script>

<footer>
	<div class="footer-grid">
		<div class="footer-brand">
			<p class="footer-logo">Mine<span>Panel</span></p>
			<p>Open source. Self-hosted. No cloud required.</p>
		</div>
		<div class="footer-links">
			<p class="footer-heading">Project</p>
			<a href={githubHref} target="_blank" rel="noopener">GitHub</a>
			<a href={getStartedHref} target="_blank" rel="noopener">Get Started / Documentation</a>
			<a href="#roadmap">Roadmap</a>
			<a href={webAppHref} target="_blank" rel="noopener">Web App</a>
		</div>
		<div class="footer-links">
			<p class="footer-heading">Legal</p>
			<a href="https://github.com/MinePanelProject/minepanel-site/blob/main/LICENSE" target="_blank" rel="noopener"
				>MIT License</a
			>
			<a href="/privacy">Privacy</a>
		</div>
	</div>
	<p class="footer-disclaimer">
		Not affiliated with Mojang Studios or Microsoft.<br />
		Minecraft is a trademark of Mojang Synergies AB.
	</p>
</footer>
