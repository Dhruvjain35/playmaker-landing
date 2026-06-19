/* PLAYMAKR — interactions. Vanilla, restrained. */
(() => {
	'use strict';
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');

	/* sticky nav */
	const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 20);
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

	/* mobile menu */
	burger?.addEventListener('click', () => {
		const open = nav.classList.toggle('is-open');
		burger.setAttribute('aria-expanded', String(open));
	});
	nav.querySelectorAll('.nav__mobile a').forEach((a) =>
		a.addEventListener('click', () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); })
	);

	/* reveals */
	const revealEls = document.querySelectorAll('[data-load], [data-reveal]');
	if (reduce || !('IntersectionObserver' in window)) {
		revealEls.forEach((el) => el.classList.add('is-in'));
	} else {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
		}, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
		revealEls.forEach((el) => io.observe(el));
	}

	/* subtle hero parallax — photo drifts slower than scroll */
	const heroBg = document.querySelector('.hero__bg');
	if (heroBg && !reduce) {
		let ticking = false;
		window.addEventListener('scroll', () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				const y = Math.min(window.scrollY, 900);
				heroBg.style.transform = `scale(1.06) translateY(${y * 0.12}px)`;
				ticking = false;
			});
		}, { passive: true });
	}

	/* FAQ accordion */
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

	/* magnetic buttons (fine pointer) */
	if (!reduce && window.matchMedia('(pointer:fine)').matches) {
		document.querySelectorAll('[data-magnetic]').forEach((el) => {
			el.addEventListener('pointermove', (e) => {
				const r = el.getBoundingClientRect();
				el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
			});
			el.addEventListener('pointerleave', () => { el.style.transform = ''; });
		});
	}

	/* email capture → Kit form 9578491 */
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
			if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; btn.textContent = 'Secured'; }
		});
	});
})();
