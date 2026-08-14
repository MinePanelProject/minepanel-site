/* Framework-independent interaction module.
 * Loaded from app.html with `defer`. It only manipulates already-rendered
 * DOM state — it never fetches content or contains endpoint URLs.
 */
(function () {
	'use strict';

	/* ─── Mobile nav toggle ─── */
	(function () {
		const nav = document.querySelector('nav');
		const toggle = document.querySelector('.nav-toggle');
		if (!nav || !toggle) return;

		function setOpen(open) {
			nav.classList.toggle('nav-open', open);
			toggle.setAttribute('aria-expanded', String(open));
		}

		toggle.addEventListener('click', () => {
			setOpen(!nav.classList.contains('nav-open'));
		});

		nav.querySelectorAll('.nav-links a').forEach((a) => {
			a.addEventListener('click', () => setOpen(false));
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
				setOpen(false);
				toggle.focus();
			}
		});

		document.addEventListener('click', (e) => {
			if (nav.classList.contains('nav-open') && !nav.contains(e.target)) {
				setOpen(false);
			}
		});
	})();

	/* ─── Roadmap tabs ─── */
	(function () {
		const tabs = Array.from(document.querySelectorAll('.roadmap-tab'));
		if (!tabs.length) return;
		const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
		const sourceEl = document.getElementById('data-source');

		function selectTab(tab) {
			tabs.forEach((t, i) => {
				const active = t === tab;
				t.setAttribute('aria-selected', String(active));
				t.tabIndex = active ? 0 : -1;
				panels[i].hidden = !active;
			});
			if (sourceEl && tab.dataset.sourceNote != null) {
				sourceEl.textContent = tab.dataset.sourceNote;
			}
		}

		tabs.forEach((tab, i) => {
			tab.addEventListener('click', () => selectTab(tab));
			tab.addEventListener('keydown', (e) => {
				let next = null;
				if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
				else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
				else if (e.key === 'Home') next = tabs[0];
				else if (e.key === 'End') next = tabs[tabs.length - 1];
				if (next) {
					e.preventDefault();
					selectTab(next);
					next.focus();
				}
			});
		});
	})();

	/* ─── Roadmap phase collapse ─── */
	(function () {
		document.querySelectorAll('.tl-phase-toggle').forEach((toggle) => {
			toggle.addEventListener('click', () => {
				const block = toggle.closest('.tl-phase-block');
				if (!block) return;
				const collapsed = block.classList.toggle('phase-collapsed');
				toggle.setAttribute('aria-expanded', String(!collapsed));
			});
		});
	})();

	/* ─── Quick Deploy copy ─── */
	(function () {
		const btn = document.getElementById('copy-deploy');
		if (!btn) return;
		btn.addEventListener('click', async () => {
			const pre = btn.closest('.deploy-box').querySelector('pre');
			if (!pre) return;
			const text = pre.textContent;
			let ok = false;
			try {
				await navigator.clipboard.writeText(text);
				ok = true;
			} catch (_) {
				try {
					const range = document.createRange();
					range.selectNodeContents(pre);
					const sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
					ok = document.execCommand('copy');
					sel.removeAllRanges();
				} catch (_2) {
					ok = false;
				}
			}
			btn.textContent = ok ? '[ Copied! ]' : '[ Copy failed ]';
			setTimeout(() => {
				btn.textContent = '[ Copy ]';
			}, 2000);
		});
	})();
})();
