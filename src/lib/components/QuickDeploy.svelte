<div class="deploy-box" style="margin-top: 32px;">
	<div class="deploy-head">
		<p class="deploy-label">[ Quick Deploy ]</p>
		<button type="button" class="copy-btn" id="copy-deploy">[ Copy ]</button>
	</div>
	<pre><span class="comment"># Clone and configure the backend</span>
<span class="cmd">git clone</span> <span class="arg">https://github.com/MinePanelProject/minepanel-backend</span>
<span class="cmd">cd</span> <span class="arg">minepanel-backend</span>
<span class="cmd">cp</span> <span class="arg">.env.example .env</span>

<span class="comment"># Set the required values in .env, then launch</span>
<span class="cmd">docker compose pull</span>
<span class="cmd">docker compose up</span> <span class="arg">-d</span></pre>
	<p class="deploy-note">
		Requires Linux, Docker, a domain, open ports 80/443, and configured secrets and Minecraft data
		storage. Read the full deployment guide before launching.
	</p>
	<a
		class="deploy-doc-link"
		href="https://github.com/MinePanelProject/minepanel-backend#quick-deploy"
		target="_blank"
		rel="noopener">[ Full deployment guide ]</a
	>
</div>
