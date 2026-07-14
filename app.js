(() => {
	'use strict';

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');

	if (nav) {
		const updateNav = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
		updateNav();
		window.addEventListener('scroll', updateNav, { passive: true });
		burger?.addEventListener('click', () => {
			const open = nav.classList.toggle('is-open');
			burger.setAttribute('aria-expanded', String(open));
		});
		nav.querySelectorAll('.nav__mobile a').forEach((link) => {
			link.addEventListener('click', () => {
				nav.classList.remove('is-open');
				burger?.setAttribute('aria-expanded', 'false');
			});
		});
	}

	const revealTargets = document.querySelectorAll('[data-reveal]');
	if (reduce || !('IntersectionObserver' in window)) {
		revealTargets.forEach((el) => el.classList.add('is-in'));
	} else {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('is-in');
				observer.unobserve(entry.target);
			});
		}, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
		revealTargets.forEach((el) => observer.observe(el));
	}

	document.querySelectorAll('[data-fake-count]').forEach((node) => {
		const start = 7000;
		const epoch = Date.parse('2026-07-01T00:00:00Z');
		const now = Date.now();
		const count = start + Math.max(0, Math.floor((now - epoch) / (19 * 60 * 1000)));
		node.textContent = count.toLocaleString('en-US');
	});

	document.querySelectorAll('[data-waitlist]').forEach((form) => {
		let role = 'fan';
		const roles = form.querySelectorAll('.role');
		const msg = form.querySelector('.capture__msg');
		const input = form.querySelector('input[type="tel"]');
		const submit = form.querySelector('button[type="submit"]');

		roles.forEach((button) => {
			button.addEventListener('click', () => {
				role = button.dataset.role || 'fan';
				roles.forEach((item) => {
					const selected = item === button;
					item.classList.toggle('is-on', selected);
					item.setAttribute('aria-checked', String(selected));
				});
			});
		});

		form.addEventListener('submit', (event) => {
			event.preventDefault();
			const digits = (input?.value || '').replace(/\D/g, '');
			if (digits.length < 10) {
				input?.setCustomValidity('Enter a valid phone number');
				input?.reportValidity();
				setTimeout(() => input?.setCustomValidity(''), 20);
				return;
			}

			if (submit) {
				submit.disabled = true;
				submit.textContent = 'Access requested';
			}
			if (input) input.disabled = true;
			if (msg) {
				const note = role === 'fan' ? '' : ' We will review your profile for creator or athlete access.';
				msg.textContent = `You're on the list. We'll text this number when access opens.${note}`;
			}
		});
	});
})();
