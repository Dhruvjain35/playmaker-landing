/* PLAYMAKR — shared interactions across pages. Vanilla, smooth. */
(() => {
	'use strict';
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const fine = window.matchMedia('(pointer:fine)').matches;
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');

	/* nav */
	if (nav) {
		const onNav = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
		onNav(); window.addEventListener('scroll', onNav, { passive: true });
		burger?.addEventListener('click', () => {
			const open = nav.classList.toggle('is-open');
			burger.setAttribute('aria-expanded', String(open));
		});
		nav.querySelectorAll('.nav__mobile a').forEach((a) =>
			a.addEventListener('click', () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }));
	}

	/* reveals + one-shot in-view triggers (counter, steps) */
	const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
		entries.forEach((e) => {
			if (!e.isIntersecting) return;
			e.target.classList.add('is-in');
			if (e.target.classList.contains('counter')) runOdo(e.target);
			io.unobserve(e.target);
		});
	}, { threshold: 0.2, rootMargin: '0px 0px -7% 0px' }) : null;

	const watch = document.querySelectorAll('[data-reveal], .steps, .counter');
	if (reduce || !io) { watch.forEach((el) => { el.classList.add('is-in'); if (el.classList.contains('counter')) runOdo(el); }); }
	else watch.forEach((el) => io.observe(el));

	/* ── odometer build + run ── */
	document.querySelectorAll('.odo__d').forEach((d) => {
		const target = +d.dataset.d, cycles = 5;
		const col = document.createElement('div'); col.className = 'odo__col';
		for (let c = 0; c < cycles; c++) for (let i = 0; i < 10; i++) { const s = document.createElement('span'); s.textContent = i; col.appendChild(s); }
		d.appendChild(col);
		d._col = col; d._offset = (cycles - 1) * 10 + target;
	});
	function runOdo(counter) {
		const reels = [...counter.querySelectorAll('.odo__d')];
		const n = reels.length;
		reels.forEach((d, i) => {
			if (reduce) { d._col.style.transform = `translateY(-${d._offset}em)`; return; }
			d._col.style.transitionDelay = ((n - 1 - i) * 0.09) + 's';
			requestAnimationFrame(() => requestAnimationFrame(() => { d._col.style.transform = `translateY(-${d._offset}em)`; }));
		});
	}

	/* ── 3D tilt: hero phone ── */
	document.querySelectorAll('[data-tilt]').forEach((t) => {
		if (!fine || reduce) return;
		const stage = t.querySelector('.tilt__stage'); if (!stage) return;
		const MAX = 12;
		t.addEventListener('pointerenter', () => t.classList.add('is-live'));
		t.addEventListener('pointermove', (e) => {
			const r = t.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width - 0.5;
			const py = (e.clientY - r.top) / r.height - 0.5;
			stage.style.setProperty('--ry', (px * MAX) + 'deg');
			stage.style.setProperty('--rx', (-py * MAX) + 'deg');
		});
		t.addEventListener('pointerleave', () => {
			t.classList.remove('is-live');
			stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg');
		});
	});

	/* ── 3D tilt: coverage cards (with sheen) ── */
	document.querySelectorAll('[data-card]').forEach((card) => {
		if (!fine || reduce) return;
		const inner = card.querySelector('.card3d__in');
		const sheen = card.querySelector('.card3d__sheen');
		card.addEventListener('pointermove', (e) => {
			const r = card.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width - 0.5;
			const py = (e.clientY - r.top) / r.height - 0.5;
			inner.style.setProperty('--ry', (px * 9) + 'deg');
			inner.style.setProperty('--rx', (-py * 9) + 'deg');
			inner.style.transition = 'transform .08s linear';
			if (sheen) { sheen.style.setProperty('--mx', ((px + 0.5) * 100) + '%'); sheen.style.setProperty('--my', ((py + 0.5) * 100) + '%'); }
		});
		card.addEventListener('pointerleave', () => {
			inner.style.transition = '';
			inner.style.setProperty('--ry', '0deg'); inner.style.setProperty('--rx', '0deg');
		});
	});

	/* ── pinned product story ── */
	const story = document.querySelector('.story');
	const caps = [...document.querySelectorAll('.cap')];
	const scenes = [...document.querySelectorAll('.story__device .scene')];
	const dots = [...document.querySelectorAll('.story__dots span')];
	const isMobile = () => window.matchMedia('(max-width: 900px)').matches;
	if (story && caps.length) {
		let cur = -1;
		const set = (i) => {
			if (i === cur) return; cur = i;
			caps.forEach((c, n) => c.classList.toggle('is-on', n === i));
			scenes.forEach((s, n) => s.classList.toggle('is-on', n === i));
			dots.forEach((d, n) => d.classList.toggle('is-on', n === i));
		};
		const onStory = () => {
			if (isMobile()) return;
			const total = story.offsetHeight - window.innerHeight;
			const p = clamp(-story.getBoundingClientRect().top / total, 0, 1);
			set(p < 0.34 ? 0 : p < 0.68 ? 1 : 2);
		};
		set(0);
		window.addEventListener('scroll', onStory, { passive: true });
		window.addEventListener('resize', onStory, { passive: true });
		let built = false;
		const buildMobile = () => {
			if (built || !isMobile()) return;
			caps.forEach((cap, i) => {
				if (!scenes[i]) return;
				const w = document.createElement('div'); w.className = 'cap__device story__device-m';
				w.innerHTML = '<div class="device device--lg"><div class="device__island"></div><div class="device__screen">' + scenes[i].innerHTML + '</div></div>';
				cap.appendChild(w);
			});
			built = true;
		};
		buildMobile(); window.addEventListener('resize', buildMobile, { passive: true });
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
	if (fine && !reduce) document.querySelectorAll('[data-magnetic]').forEach((el) => {
		el.addEventListener('pointermove', (e) => {
			const r = el.getBoundingClientRect();
			el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.26}px)`;
		});
		el.addEventListener('pointerleave', () => { el.style.transform = ''; });
	});

	/* capture → Kit 9578491 */
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
