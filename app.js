/* PLAYMAKR — interactions. No framework, no tracking. */
(() => {
	'use strict';
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');
	const progress = document.getElementById('navProgress');

	/* hero load sequence */
	requestAnimationFrame(() => document.body.classList.add('loaded'));

	/* sticky nav + scroll progress */
	const onScroll = () => {
		const y = window.scrollY;
		nav.classList.toggle('is-stuck', y > 24);
		if (progress) {
			const h = document.documentElement.scrollHeight - window.innerHeight;
			progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
		}
	};
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
	const reveals = document.querySelectorAll('[data-reveal]');
	if (reduce || !('IntersectionObserver' in window)) {
		reveals.forEach((el) => el.classList.add('is-in'));
	} else {
		const io = new IntersectionObserver(
			(entries) => entries.forEach((e) => {
				if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
			}),
			{ threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
		);
		reveals.forEach((el) => io.observe(el));
	}

	/* magnetic buttons (pointer-fine only) */
	if (!reduce && window.matchMedia('(pointer:fine)').matches) {
		document.querySelectorAll('[data-magnetic]').forEach((el) => {
			el.addEventListener('pointermove', (e) => {
				const r = el.getBoundingClientRect();
				const x = (e.clientX - r.left - r.width / 2) * 0.25;
				const y = (e.clientY - r.top - r.height / 2) * 0.35;
				el.style.transform = `translate(${x}px, ${y}px)`;
			});
			el.addEventListener('pointerleave', () => { el.style.transform = ''; });
		});
	}

	/* subtle device parallax */
	const device = document.querySelector('[data-parallax]');
	if (device && !reduce) {
		let ticking = false;
		window.addEventListener('scroll', () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				const r = device.getBoundingClientRect();
				const offset = (window.innerHeight - r.top) * 0.03;
				device.style.transform = `translateY(${Math.max(-24, Math.min(24, offset - 12))}px)`;
				ticking = false;
			});
		}, { passive: true });
	}

	/* FAQ accordion */
	document.querySelectorAll('.qa').forEach((qa) => {
		const btn = qa.querySelector('.qa__q');
		btn.addEventListener('click', () => {
			const open = qa.getAttribute('aria-open') === 'true';
			// close siblings for a clean single-open accordion
			document.querySelectorAll('.qa[aria-open="true"]').forEach((other) => {
				if (other !== qa) { other.setAttribute('aria-open', 'false'); other.querySelector('.qa__q').setAttribute('aria-expanded', 'false'); }
			});
			qa.setAttribute('aria-open', String(!open));
			btn.setAttribute('aria-expanded', String(!open));
		});
	});

	/* email capture — front-end stub. Wire to your backend / PocketBase. */
	document.querySelectorAll('[data-capture]').forEach((form) => {
		const msg = form.querySelector('.capture__msg');
		const input = form.querySelector('input[type="email"]');
		const btn = form.querySelector('button[type="submit"]');
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!input.checkValidity()) { input.reportValidity(); return; }
			form.classList.add('is-done');
			if (msg) msg.textContent = "You're in the feed. We'll be in touch.";
			input.value = ''; input.disabled = true;
			if (btn) {
				btn.disabled = true; btn.style.opacity = '0.6';
				const label = btn.childNodes[0];
				if (label) label.textContent = 'Secured ';
			}
		});
	});
})();
