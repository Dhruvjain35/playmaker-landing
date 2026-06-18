/* PLAYMAKR interactions. No framework, no tracking. */
(() => {
	'use strict';

	/* Purge any leftover service worker + caches from the old Hostinger site
	   so returning visitors aren't served the stale app shell. */
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.getRegistrations()
			.then((regs) => regs.forEach((r) => r.unregister()))
			.catch(() => {});
	}
	if (window.caches && caches.keys) {
		caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
	}

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

	/* ───── email capture (Kit / ConvertKit) ──────────────────────────
	   Paste your Kit form ID below. It is the number in the form's embed URL
	   (app.kit.com/forms/123456/subscriptions). That's all that's needed:
	   capture runs client-side, signups land in your Kit audience, and going
	   live is one Broadcast to everyone. Leave it '' and the form still
	   confirms visitors so the page is never broken. */
	const KIT_FORM_ID = '9578491';
	const WAITLIST_ENDPOINT = KIT_FORM_ID
		? 'https://app.kit.com/forms/' + KIT_FORM_ID + '/subscriptions'
		: '';

	const done = (form, msg, input, btn, text) => {
		form.classList.add('is-done');
		if (msg) msg.textContent = text;
		input.value = ''; input.disabled = true;
		if (btn) {
			btn.disabled = true; btn.style.opacity = '0.65';
			const label = btn.childNodes[0];
			if (label) label.textContent = 'You’re in ';
		}
	};

	document.querySelectorAll('[data-capture]').forEach((form) => {
		const msg = form.querySelector('.capture__msg');
		const input = form.querySelector('input[type="email"]');
		const btn = form.querySelector('button[type="submit"]');
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (!input.checkValidity()) { input.reportValidity(); return; }
			const email = input.value.trim();
			const source = form.getAttribute('aria-label') || 'landing';

			if (!WAITLIST_ENDPOINT) {
				done(form, msg, input, btn, "You're on the list. We'll text you when we go live.");
				return;
			}
			if (btn) { btn.disabled = true; const l = btn.childNodes[0]; if (l) l.textContent = 'Adding… '; }
			try {
				const res = await fetch(WAITLIST_ENDPOINT, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
					body: new URLSearchParams({ email_address: email }),
				});
				if (!res.ok) throw new Error('bad status ' + res.status);
				done(form, msg, input, btn, "You're on the list. We'll text you when we go live.");
			} catch (err) {
				if (btn) { btn.disabled = false; const l = btn.childNodes[0]; if (l) l.textContent = 'Get Access '; }
				if (msg) { msg.textContent = 'Hmm, that didn’t go through. Try again?'; form.classList.add('is-done'); }
			}
		});
	});

	/* canvas particle network (gradient nodes + links) */
	(function fx() {
		const cv = document.getElementById('fx');
		if (!cv || reduce) return;
		const ctx = cv.getContext('2d');
		const COLORS = ['#b14dff', '#5b7cff', '#2ad4e8'];
		let w, h, dpr, parts;
		const resize = () => {
			dpr = Math.min(2, window.devicePixelRatio || 1);
			w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
			cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
			const n = Math.min(64, Math.floor(innerWidth / 24));
			parts = Array.from({ length: n }, (_, i) => ({
				x: Math.random() * w, y: Math.random() * h,
				vx: (Math.random() - 0.5) * 0.22 * dpr, vy: (Math.random() - 0.5) * 0.22 * dpr,
				c: COLORS[i % 3], r: (Math.random() * 1.5 + 0.6) * dpr,
			}));
		};
		resize();
		window.addEventListener('resize', resize, { passive: true });
		const tick = () => {
			ctx.clearRect(0, 0, w, h);
			for (const p of parts) {
				p.x += p.vx; p.y += p.vy;
				if (p.x < 0 || p.x > w) p.vx *= -1;
				if (p.y < 0 || p.y > h) p.vy *= -1;
				ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
				ctx.fillStyle = p.c; ctx.globalAlpha = 0.7; ctx.fill();
			}
			const max = 132 * dpr;
			for (let i = 0; i < parts.length; i++) {
				for (let j = i + 1; j < parts.length; j++) {
					const a = parts[i], b = parts[j];
					const d = Math.hypot(a.x - b.x, a.y - b.y);
					if (d < max) {
						ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
						ctx.strokeStyle = a.c; ctx.globalAlpha = (1 - d / max) * 0.12;
						ctx.lineWidth = dpr * 0.6; ctx.stroke();
					}
				}
			}
			ctx.globalAlpha = 1;
			requestAnimationFrame(tick);
		};
		tick();
	})();

	/* hero logo 3D tilt */
	if (!reduce && window.matchMedia('(pointer:fine)').matches) {
		document.querySelectorAll('[data-tilt]').forEach((el) => {
			el.addEventListener('pointermove', (e) => {
				const r = el.getBoundingClientRect();
				const px = (e.clientX - r.left) / r.width - 0.5;
				const py = (e.clientY - r.top) / r.height - 0.5;
				el.style.transform = `perspective(600px) rotateY(${px * 16}deg) rotateX(${-py * 16}deg)`;
			});
			el.addEventListener('pointerleave', () => { el.style.transform = ''; });
		});
	}
})();
