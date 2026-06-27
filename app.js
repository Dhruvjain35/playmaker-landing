/* PLAYMAKR — interactions. Vanilla, tuned for smoothness. */
(() => {
	'use strict';
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

	/* nav */
	const onNav = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
	onNav();
	window.addEventListener('scroll', onNav, { passive: true });
	burger?.addEventListener('click', () => {
		const open = nav.classList.toggle('is-open');
		burger.setAttribute('aria-expanded', String(open));
	});
	nav.querySelectorAll('.nav__mobile a').forEach((a) =>
		a.addEventListener('click', () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }));

	/* reveals */
	const revealEls = document.querySelectorAll('[data-reveal]');
	if (reduce || !('IntersectionObserver' in window)) {
		revealEls.forEach((el) => el.classList.add('is-in'));
	} else {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
		}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
		revealEls.forEach((el) => io.observe(el));
	}

	/* count-up */
	document.querySelectorAll('[data-count]').forEach((el) => {
		const target = parseInt(el.dataset.count, 10) || 0;
		const run = () => {
			if (reduce) { el.textContent = target.toLocaleString(); return; }
			const start = performance.now(), dur = 1400;
			const tick = (now) => {
				const p = Math.min(1, (now - start) / dur);
				el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
				if (p < 1) requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		};
		if ('IntersectionObserver' in window) {
			const o = new IntersectionObserver((en, ob) => en.forEach((e) => { if (e.isIntersecting) { run(); ob.disconnect(); } }), { threshold: 0.6 });
			o.observe(el);
		} else run();
	});

	/* ── pinned product story ── */
	const story = document.querySelector('.story');
	const caps = [...document.querySelectorAll('.cap')];
	const scenes = [...document.querySelectorAll('.story__device .scene')];
	const dots = [...document.querySelectorAll('.story__dots span')];
	const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

	if (story && caps.length) {
		let current = -1;
		const setActive = (i) => {
			if (i === current) return;
			current = i;
			caps.forEach((c, n) => c.classList.toggle('is-on', n === i));
			scenes.forEach((s, n) => s.classList.toggle('is-on', n === i));
			dots.forEach((d, n) => d.classList.toggle('is-on', n === i));
		};
		const onStory = () => {
			if (isMobile()) return;
			const total = story.offsetHeight - window.innerHeight;
			const p = clamp(-story.getBoundingClientRect().top / total, 0, 1);
			setActive(p < 0.34 ? 0 : p < 0.68 ? 1 : 2);
		};
		setActive(0);
		window.addEventListener('scroll', onStory, { passive: true });
		window.addEventListener('resize', onStory, { passive: true });

		/* mobile: give each caption its own device cloned from the scenes */
		let built = false;
		const buildMobile = () => {
			if (built || !isMobile()) return;
			caps.forEach((cap, i) => {
				if (!scenes[i]) return;
				const wrap = document.createElement('div');
				wrap.className = 'cap__device';
				wrap.innerHTML = '<div class="device device--lg"><div class="device__island"></div><div class="device__screen">' + scenes[i].innerHTML + '</div></div>';
				cap.appendChild(wrap);
			});
			built = true;
		};
		buildMobile();
		window.addEventListener('resize', buildMobile, { passive: true });
	}

	/* FAQ */
	document.querySelectorAll('.qa').forEach((qa) => {
		const btn = qa.querySelector('.qa__q');
		btn.addEventListener('click', () => {
			const open = qa.getAttribute('aria-open') === 'true';
			document.querySelectorAll('.qa[aria-open="true"]').forEach((o) => {
				if (o !== qa) { o.setAttribute('aria-open', 'false'); o.querySelector('.qa__q').setAttribute('aria-expanded', 'false'); }
			});
			qa.setAttribute('aria-open', String(!open));
			btn.setAttribute('aria-expanded', String(!open));
		});
	});

	/* magnetic */
	if (!reduce && window.matchMedia('(pointer:fine)').matches) {
		document.querySelectorAll('[data-magnetic]').forEach((el) => {
			el.addEventListener('pointermove', (e) => {
				const r = el.getBoundingClientRect();
				el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.26}px)`;
			});
			el.addEventListener('pointerleave', () => { el.style.transform = ''; });
		});
	}

	/* capture → Kit form 9578491 */
	const KIT = 'https://app.kit.com/forms/9578491/subscriptions';
	document.querySelectorAll('[data-capture]').forEach((form) => {
		const msg = form.querySelector('.capture__msg');
		const input = form.querySelector('input[type="email"]');
		const btn = form.querySelector('button[type="submit"]');
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!input.checkValidity()) { input.reportValidity(); return; }
			const fd = new FormData(); fd.append('email_address', input.value.trim());
			fetch(KIT, { method: 'POST', body: fd, mode: 'no-cors' }).catch(() => {});
			form.classList.add('is-done');
			if (msg) msg.textContent = "You're on the list. We'll text you when your spot opens.";
			input.value = ''; input.disabled = true;
			if (btn) { btn.disabled = true; btn.style.opacity = '0.55'; btn.textContent = 'Secured'; }
		});
	});
})();
