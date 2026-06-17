/* PLAYMAKR — light interactions. No framework, no tracking. */
(() => {
	'use strict';
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');

	/* sticky nav background after scrolling past the fold edge */
	const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

	/* mobile menu */
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

	/* scroll reveals */
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const reveals = document.querySelectorAll('[data-reveal]');
	if (reduce || !('IntersectionObserver' in window)) {
		reveals.forEach((el) => el.classList.add('is-in'));
	} else {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add('is-in');
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
		);
		reveals.forEach((el) => io.observe(el));
	}

	/* email capture — front-end only stub. Wire to PocketBase / your backend later. */
	document.querySelectorAll('[data-capture]').forEach((form) => {
		const msg = form.querySelector('.capture__msg');
		const input = form.querySelector('input[type="email"]');
		const btn = form.querySelector('button[type="submit"]');
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!input.checkValidity()) {
				input.reportValidity();
				return;
			}
			form.classList.add('is-done');
			if (msg) msg.textContent = "You're in the feed. We'll be in touch.";
			input.value = '';
			input.disabled = true;
			if (btn) {
				btn.disabled = true;
				btn.style.opacity = '0.6';
				const label = btn.childNodes[0];
				if (label) label.textContent = 'Secured ';
			}
		});
	});
})();
