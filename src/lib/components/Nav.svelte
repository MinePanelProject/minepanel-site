<script lang="ts">
	let { stars }: { stars: number | null } = $props();
</script>

<nav>
	<a class="logo" href="#about" aria-label="MinePanel — back to top">
		<img class="logo-img" src="/logo-hero.png" width="256" height="256" alt="" />
	</a>
	<a
		class="nav-stars"
		id="gh-stars"
		hidden={stars === null}
		href="https://github.com/MinePanelProject/minepanel-backend"
		target="_blank"
		rel="noopener"
		aria-label="Star MinePanel on GitHub"
	>
		<span class="nav-stars-ico"
			><svg viewBox="0 0 14 10" width="14" height="10" aria-hidden="true" fill="currentColor"
				><rect x="6" y="0" width="4" height="2" /><rect x="4" y="2" width="8" height="2" /><rect
					x="2"
					y="4"
					width="12"
					height="2"
				/><rect x="4" y="6" width="4" height="2" /><rect x="8" y="6" width="4" height="2" /><rect
					x="6"
					y="8"
					width="4"
					height="2"
				/></svg
			></span
		><span class="nav-stars-label">Stars:</span><span class="nav-stars-num">{stars ?? 0}</span>
	</a>
	<div class="nav-links" id="mobile-menu">
		<a href="#about">About</a>
		<a href="#features">Features</a>
		<a href="#stack">Stack</a>
		<a href="#team">Team</a>
		<a href="#roadmap">Roadmap</a>
	</div>
	<button
		type="button"
		class="nav-toggle"
		aria-expanded="false"
		aria-controls="mobile-menu"
		aria-label="Toggle navigation"
	>
		<span class="nav-toggle-bar"></span>
		<span class="nav-toggle-bar"></span>
		<span class="nav-toggle-bar"></span>
	</button>
</nav>
