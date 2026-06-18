/* PLAYMAKR — Lenis + GSAP motion (ref: bevel.health). Graceful fallback. */
(() => {
	'use strict';

	/* purge any old service worker / caches from prior versions */
	if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister())).catch(() => {});
	if (window.caches && caches.keys) caches.keys().then(k => k.forEach(x => caches.delete(x))).catch(() => {});

	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const hasGSAP = !!(window.gsap && window.ScrollTrigger);
	const root = document.documentElement;
	if (hasGSAP && !reduce) root.classList.add('anim');

	/* ---- nav ---- */
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');
	const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
	onScroll();
	addEventListener('scroll', onScroll, { passive: true });
	burger?.addEventListener('click', () => {
		const open = nav.classList.toggle('is-open');
		burger.setAttribute('aria-expanded', String(open));
	});
	nav.querySelectorAll('.nav__mobile a').forEach(a => a.addEventListener('click', () => {
		nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
	}));

	/* ---- magnetic buttons ---- */
	if (!reduce && matchMedia('(pointer:fine)').matches) {
		document.querySelectorAll('[data-magnetic]').forEach(el => {
			el.addEventListener('pointermove', e => {
				const r = el.getBoundingClientRect();
				el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
			});
			el.addEventListener('pointerleave', () => { el.style.transform = ''; });
		});
	}

	/* ---- motion (GSAP + Lenis) ---- */
	if (hasGSAP && !reduce) {
		const { gsap, ScrollTrigger } = window;
		gsap.registerPlugin(ScrollTrigger);

		if (window.Lenis) {
			const lenis = new window.Lenis();
			lenis.on('scroll', ScrollTrigger.update);
			gsap.ticker.add(t => lenis.raf(t * 1000));
			gsap.ticker.lagSmoothing(0);
			// keep anchor links smooth
			document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
				const id = a.getAttribute('href');
				if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -70 }); }
			}));
		}

		/* fade-up reveals, staggered as they enter */
		const reveals = gsap.utils.toArray('[data-reveal]');
		gsap.set(reveals, { opacity: 0, y: 34 });
		ScrollTrigger.batch(reveals, {
			start: 'top 86%',
			onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09, overwrite: true }),
		});
		// failsafe: reveal anything still hidden after load
		addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 200));

		/* hero idle float + scroll parallax */
		const floats = gsap.utils.toArray('[data-float]');
		floats.forEach((el, i) => {
			gsap.to(el, { y: '-=14', duration: 3.6 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.2 });
		});
		const depth = { '0': -50, '1': -110, '2': 60, '3': -90 };
		floats.forEach(el => {
			const d = depth[el.getAttribute('data-float')] ?? -40;
			gsap.to(el, { y: `+=${d}`, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.4 } });
		});

		/* pastel wash parallax */
		gsap.to('.wash', { yPercent: -10, scale: 1.08, ease: 'none', scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 } });
	}

	/* ---- email capture (Kit) ---- */
	const KIT_FORM_ID = '9578491';
	const ENDPOINT = 'https://app.kit.com/forms/' + KIT_FORM_ID + '/subscriptions';
	document.querySelectorAll('[data-capture]').forEach(form => {
		const msg = form.querySelector('.capture__msg');
		const input = form.querySelector('input[type="email"]');
		const btn = form.querySelector('button[type="submit"]');
		const done = t => { form.classList.add('is-done'); if (msg) msg.textContent = t; input.value = ''; input.disabled = true; if (btn) { btn.disabled = true; btn.style.opacity = '.6'; if (btn.firstChild) btn.firstChild.textContent = 'You’re in'; } };
		form.addEventListener('submit', async e => {
			e.preventDefault();
			if (!input.checkValidity()) { input.reportValidity(); return; }
			if (btn) btn.disabled = true;
			try {
				const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }, body: new URLSearchParams({ email_address: input.value.trim() }) });
				if (!res.ok) throw 0;
				done("You're on the list. We'll text you when we go live.");
			} catch { if (btn) btn.disabled = false; if (msg) { msg.textContent = 'That did not go through. Try again?'; form.classList.add('is-done'); } }
		});
	});
})();
