/* PLAYMAKR — the sports desk. Vanilla, no framework. */
(() => {
	'use strict';
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');
	const progress = document.getElementById('navProgress');

	/* ───── sticky nav + scroll progress ───── */
	const onScroll = () => {
		const y = window.scrollY;
		nav.classList.toggle('is-stuck', y > 20);
		if (progress) {
			const h = document.documentElement.scrollHeight - window.innerHeight;
			progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
		}
	};
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

	/* ───── mobile menu ───── */
	burger?.addEventListener('click', () => {
		const open = nav.classList.toggle('is-open');
		burger.setAttribute('aria-expanded', String(open));
	});
	nav.querySelectorAll('.nav__mobile a').forEach((a) =>
		a.addEventListener('click', () => {
			nav.classList.remove('is-open');
			burger.setAttribute('aria-expanded', 'false');
		})
	);

	/* ───── headline word-mask split ───── */
	document.querySelectorAll('[data-words]').forEach((h) => {
		const units = [];
		h.childNodes.forEach((node) => {
			if (node.nodeType === 3) {
				node.textContent.split(/\s+/).forEach((t) => { if (t.trim()) units.push({ text: t }); });
			} else if (node.nodeType === 1) {
				units.push({ el: node });
			}
		});
		h.textContent = '';
		units.forEach((u, i) => {
			const word = document.createElement('span');
			word.className = 'word';
			const inner = document.createElement('span');
			inner.style.setProperty('--wi', i);
			if (u.el) inner.appendChild(u.el); else inner.textContent = u.text;
			word.appendChild(inner);
			h.appendChild(word);
			h.appendChild(document.createTextNode(' '));
		});
	});

	/* ───── reveal on enter ───── */
	const revealEls = document.querySelectorAll('[data-load], [data-reveal], [data-words]');
	if (reduce || !('IntersectionObserver' in window)) {
		revealEls.forEach((el) => el.classList.add('is-in'));
	} else {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
			});
		}, { threshold: 0.18, rootMargin: '0px 0px -7% 0px' });
		revealEls.forEach((el) => io.observe(el));
	}

	/* ───── count-up helper ───── */
	const countUp = (el) => {
		const target = parseInt(el.dataset.count, 10) || 0;
		if (reduce) { el.textContent = target; return; }
		const dur = 900, start = performance.now();
		const tick = (now) => {
			const p = Math.min(1, (now - start) / dur);
			const eased = 1 - Math.pow(1 - p, 3);
			el.textContent = Math.round(eased * target);
			if (p < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	};

	/* ───── hero thread choreography ───── */
	const heroThread = document.querySelector('[data-hero-thread]');
	if (heroThread) {
		const steps = [...heroThread.querySelectorAll('[data-step]')];
		const counts = heroThread.querySelectorAll('[data-count]');
		if (reduce) {
			steps.forEach((s) => s.classList.add('show'));
			counts.forEach((c) => (c.textContent = c.dataset.count));
		} else {
			const cues = [350, 1150, 2150, 2800, 3450];
			const play = () => {
				steps.forEach((s) => s.classList.remove('show'));
				steps.forEach((s, i) => setTimeout(() => {
					s.classList.add('show');
					if (s.querySelector('[data-count]')) s.querySelectorAll('[data-count]').forEach(countUp);
				}, cues[i] || i * 700));
			};
			// start when in view
			const startIO = new IntersectionObserver((entries, obs) => {
				entries.forEach((e) => { if (e.isIntersecting) { play(); obs.disconnect(); } });
			}, { threshold: 0.4 });
			startIO.observe(heroThread);
		}
	}

	/* ───── scrollytelling: swap pinned scenes ───── */
	const scenes = [...document.querySelectorAll('.scene')];
	const panels = [...document.querySelectorAll('.panel')];
	if (scenes.length && panels.length) {
		const setScene = (i) => scenes.forEach((s) => s.classList.toggle('is-active', +s.dataset.scene === i));
		const sio = new IntersectionObserver((entries) => {
			entries.forEach((e) => { if (e.isIntersecting) setScene(+e.target.dataset.panel); });
		}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
		panels.forEach((p) => sio.observe(p));

		/* mobile: clone each scene into its panel as a mini phone */
		let built = false;
		const buildMobile = () => {
			if (built || !window.matchMedia('(max-width: 940px)').matches) return;
			panels.forEach((p, i) => {
				const sc = scenes[i];
				if (!sc) return;
				const mini = document.createElement('div');
				mini.className = 'panel__mini';
				mini.innerHTML = '<div class="phone phone--mini"><div class="phone__screen">' + sc.innerHTML + '</div></div>';
				p.insertBefore(mini, p.firstChild);
			});
			built = true;
		};
		buildMobile();
		window.addEventListener('resize', buildMobile, { passive: true });
	}

	/* ───── FAQ accordion ───── */
	document.querySelectorAll('.qa').forEach((qa) => {
		const btn = qa.querySelector('.qa__q');
		btn.addEventListener('click', () => {
			const open = qa.getAttribute('aria-open') === 'true';
			document.querySelectorAll('.qa[aria-open="true"]').forEach((other) => {
				if (other !== qa) { other.setAttribute('aria-open', 'false'); other.querySelector('.qa__q').setAttribute('aria-expanded', 'false'); }
			});
			qa.setAttribute('aria-open', String(!open));
			btn.setAttribute('aria-expanded', String(!open));
		});
	});

	/* ───── magnetic buttons (fine pointer only) ───── */
	if (!reduce && window.matchMedia('(pointer:fine)').matches) {
		document.querySelectorAll('[data-magnetic]').forEach((el) => {
			el.addEventListener('pointermove', (e) => {
				const r = el.getBoundingClientRect();
				const x = (e.clientX - r.left - r.width / 2) * 0.22;
				const y = (e.clientY - r.top - r.height / 2) * 0.3;
				el.style.transform = `translate(${x}px, ${y}px)`;
			});
			el.addEventListener('pointerleave', () => { el.style.transform = ''; });
		});
	}

	/* ───── email capture → Kit (ConvertKit) form 9578491 ───── */
	const KIT_ENDPOINT = 'https://app.kit.com/forms/9578491/subscriptions';
	document.querySelectorAll('[data-capture]').forEach((form) => {
		const msg = form.querySelector('.capture__msg');
		const input = form.querySelector('input[type="email"]');
		const btn = form.querySelector('button[type="submit"]');
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!input.checkValidity()) { input.reportValidity(); return; }
			const email = input.value.trim();
			const fd = new FormData();
			fd.append('email_address', email);
			fetch(KIT_ENDPOINT, { method: 'POST', body: fd, mode: 'no-cors' }).catch(() => {});
			form.classList.add('is-done');
			if (msg) msg.textContent = "You're on the list. We'll text you when your spot opens.";
			input.value = ''; input.disabled = true;
			if (btn) {
				btn.disabled = true; btn.style.opacity = '0.6';
				const label = btn.childNodes[0];
				if (label) label.textContent = 'Secured ';
			}
		});
	});
})();
