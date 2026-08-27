<section class="section project-status" id="status" aria-labelledby="status-title">
	<p class="section-label">[ Project Status ]</p>
	<h2 class="section-title" id="status-title">Usable today. Still being built.</h2>
	<div class="status-grid">
		<article class="status-card mc-panel">
			<p class="status-kicker status-kicker--live">[ EARLY ACCESS ]</p>
			<h3>MinePanel is already running.</h3>
			<p>
				You can self-host the panel today on your own hardware. The hosted dashboard is a client for
				self-hosted instances; MinePanel does not host your Minecraft servers for you.
			</p>
			<ul>
				<li>Docker deployment with PostgreSQL and Caddy HTTPS</li>
				<li>Account authentication, sessions, TOTP 2FA, and optional Google sign-in</li>
				<li>Create, start, stop, restart, and delete Minecraft servers</li>
				<li>Per-server OPEN, REQUEST, and PRIVATE access controls</li>
				<li>Admin host metrics over authenticated WebSocket connections</li>
			</ul>
		</article>

		<article class="status-card status-card--next mc-panel">
			<p class="status-kicker">[ ACTIVE DEVELOPMENT ]</p>
			<h3>More operations are on the roadmap.</h3>
			<p>
				The foundation is usable, while the operational surface is still expanding. Current roadmap work
				includes:
			</p>
			<ul>
				<li>Richer real-time events and server console operations</li>
				<li>Backups and scheduled tasks</li>
				<li>File and plugin management</li>
				<li>Velocity proxy and Bedrock networking</li>
			</ul>
		</article>
	</div>
</section>
