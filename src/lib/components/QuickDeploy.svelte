<div class="deploy-box" style="margin-top: 32px;">
	<div class="deploy-head">
		<p class="deploy-label">[ Quick Deploy ]</p>
		<button type="button" class="copy-btn" id="copy-deploy">[ Copy ]</button>
	</div>
	<pre><span class="comment"># Download deployment assets for the current edge channel</span>
<span class="cmd">curl</span> <span class="arg">-fsSLo docker-compose.yml https://raw.githubusercontent.com/MinePanelProject/minepanel-backend/master/docker-compose.yml</span>
<span class="cmd">curl</span> <span class="arg">-fsSLo .env.example https://raw.githubusercontent.com/MinePanelProject/minepanel-backend/master/.env.example</span>
<span class="cmd">curl</span> <span class="arg">-fsSLo Caddyfile https://raw.githubusercontent.com/MinePanelProject/minepanel-backend/master/Caddyfile</span>
<span class="cmd">cp</span> <span class="arg">.env.example .env</span>

<span class="comment"># Set required values in .env, then use pre-stable edge</span>
<span class="cmd">sed</span> <span class="arg">-i 's|^MINEPANEL_IMAGE=.*|MINEPANEL_IMAGE=ghcr.io/minepanelproject/minepanel-backend:edge|'</span> <span class="arg">.env</span>
<span class="cmd">docker compose pull</span>
<span class="cmd">docker compose up</span> <span class="arg">-d</span></pre>
	<p class="deploy-note">
		Edge is the current pre-stable channel; no stable release is published yet. Requires Docker Engine
		with Compose, a domain, open ports 80/443, configured secrets, and Minecraft data storage.
	</p>
	<a
		class="deploy-doc-link"
		href="https://github.com/MinePanelProject/minepanel-backend/blob/master/docs/deployment.md"
		target="_blank"
		rel="noopener">[ Full deployment guide ]</a
	>
</div>
