
<main class="legal-page">
	<a class="legal-back" href="/">← Back to MinePanel</a>
	<p class="section-label">[ Privacy ]</p>
	<h1 class="section-title">Privacy Notice</h1>
	<p class="legal-lede">
		This notice describes the public MinePanel website at <strong>minepanel.xyz</strong>. It does not
		replace the privacy notices of linked services or of a self-hosted MinePanel instance.
	</p>

	<section class="legal-section">
		<h2>Who operates this site</h2>
		<dl class="legal-contact">
			<div>
				<dt>Controller / operator</dt>
				<dd>MinePanel contributors</dd>
			</div>
			<div>
				<dt>Privacy contact</dt>
				<dd>
					The project repositories do not currently publish a dedicated privacy email address.
					The available project contact channel is the
					<a href="https://github.com/MinePanelProject" target="_blank" rel="noopener"
						>MinePanelProject GitHub organization</a
					>. Please do not post personal information in a public issue.
				</dd>
			</div>
		</dl>
	</section>

	<section class="legal-section">
		<h2>What this site processes</h2>
		<ul>
			<li>
				When you visit the site, Cloudflare may process request metadata such as your IP address,
				browser and device headers, requested URL, timestamp, and security signals in its role as
				hosting and edge infrastructure.
			</li>
			<li>
				The site server retrieves project content and roadmap JSON from public GitHub raw-content
				endpoints. This is a server-side fetch; your browser does not connect to those endpoints for
				roadmap data.
			</li>
			<li>
				Team avatars are loaded directly by your browser from GitHub's avatar service
				(<code>avatars.githubusercontent.com</code>). That connection may disclose normal technical
				request data, such as your IP address and user-agent or network metadata, to GitHub. This is
				not used by MinePanel as analytics, advertising, or profiling.
			</li>
			<li>
				If you follow a link to GitHub, the hosted dashboard, or another external service, that service
				processes your request under its own policies.
			</li>
		</ul>
	</section>

	<section class="legal-section">
		<h2>Why and on what basis</h2>
		<p>
			Request metadata is used by the hosting and security infrastructure to deliver the site, keep it
			available, and detect abuse. Team avatar delivery supports the team display but is not used by
			MinePanel as analytics, advertising, or profiling. The basis is legitimate interest in operating
			and securing the website (GDPR Article 6(1)(f)). Content requests to public GitHub sources support
			the roadmap display and do not intentionally include visitor data.
		</p>
	</section>

	<section class="legal-section">
		<h2>Cookies, storage, and tracking</h2>
		<p>
			This site has no advertising, profiling, behavioral analytics, marketing pixels, contact forms,
			essential site login, or embedded third-party widgets. It does not set cookies and does not use
			localStorage or sessionStorage. It uses locally hosted fonts and local scripts; team avatars are
			the intentional exception and load from GitHub's avatar service. Platform security and request
			logging may still occur at the infrastructure layer. A cookie banner is not used solely because
			the avatars are remotely hosted.
		</p>
	</section>

	<section class="legal-section">
		<h2>Infrastructure, transfers, and retention</h2>
		<p>
			The site runs on Cloudflare Pages/Workers. Public roadmap content is retrieved from GitHub's raw
			content service by the site runtime and cached at the edge. Cloudflare and GitHub may process
			infrastructure data internationally, including outside the EEA, under their own terms and
			transfer mechanisms. MinePanel contributors do not maintain a visitor database or user profile.
			Exact retention periods for platform security logs are controlled by the relevant provider's
			policies and operational requirements, not by this site.
		</p>
	</section>

	<section class="legal-section">
		<h2>Your rights</h2>
		<p>
			Subject to applicable law, you may request access to, correction or deletion of personal data,
			restriction of processing, objection to processing based on legitimate interests, and data
			portability where applicable. You may also complain to the supervisory authority in the country
			where you live, work, or believe an infringement occurred. Requests should be directed through
			the project contact channel above; requests involving Cloudflare or GitHub data may need to be
			made to those providers directly.
		</p>
	</section>

	<section class="legal-section">
		<h2>External links and related services</h2>
		<p>
			MinePanel links to GitHub repositories and to the hosted MinePanel dashboard at
			<a href="https://app.minepanel.xyz" target="_blank" rel="noopener">app.minepanel.xyz</a>.
			The dashboard connects directly to operator-selected self-hosted backends and has its own
			processing model. Review each service's notice before using it.
		</p>
	</section>

	<p class="legal-updated">Last updated: <time datetime="2026-08-27">27 August 2026</time></p>
</main>
