/* PLAYMAKR — shared interactions across pages. Vanilla, smooth. */
(() => {
	'use strict';
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const fine = window.matchMedia('(pointer:fine)').matches;
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	const nav = document.getElementById('nav');
	const burger = document.getElementById('burger');

	/* ── premium iOS chrome injected into every phone screen ── */
	const STATUS = '<div class="ios-status"><span class="ios-time">9:41</span><span class="ios-ind"><i class="ios-sig"></i><i class="ios-wifi"></i><i class="ios-bat"></i></span></div>';
	const INPUT = '<div class="ios-input"><span class="ios-field">Message</span><span class="ios-send"></span></div>';
	const chrome = (screen) => {
		if (screen.dataset.chromed) return;
		screen.dataset.chromed = '1';
		screen.insertAdjacentHTML('afterbegin', STATUS);
		screen.insertAdjacentHTML('beforeend', INPUT);
	};
	document.querySelectorAll('.device__screen').forEach(chrome);

	/* ── league emblem strip (original monochrome marks) ── */
	const ICONS = {
		bball: '<circle cx="12" cy="12" r="9.2"/><path d="M12 2.8v18.4M2.8 12h18.4M5.6 5.6c3.4 3.4 3.4 9.4 0 12.8M18.4 5.6c-3.4 3.4-3.4 9.4 0 12.8"/>',
		fball: '<ellipse cx="12" cy="12" rx="9" ry="5.4" transform="rotate(-32 12 12)"/><path d="M8.8 15.2l6.4-6.4"/><path d="M10.4 12.4l1.4 1.4M11.9 10.9l1.4 1.4M13.4 9.4l1.4 1.4"/>',
		baseball: '<circle cx="12" cy="12" r="9.2"/><path d="M6.2 5.4c2.6 3.1 2.6 10.1 0 13.2M17.8 5.4c-2.6 3.1-2.6 10.1 0 13.2"/>',
		hockey: '<path d="M5 5l9.5 11M5 5v3M5 5h3M19 5L9.5 16M19 5v3M19 5h-3"/><rect x="9.6" y="17.8" width="4.8" height="2.4" rx="1.2"/>',
		soccer: '<circle cx="12" cy="12" r="9.2"/><path d="M12 7.2l3.4 2.5-1.3 4h-4.2l-1.3-4z"/><path d="M12 7.2V3.4M15.4 9.7l3.3-1.4M14.1 13.7l2 3M9.9 13.7l-2 3M8.6 9.7L5.3 8.3"/>',
		trophy: '<path d="M8 4.5h8v3.2a4 4 0 0 1-8 0V4.5z"/><path d="M8 5.6H5.4a2.6 2.6 0 0 0 2.6 2.6M16 5.6h2.6a2.6 2.6 0 0 1-2.6 2.6"/><path d="M12 11.6v3.2M9.2 19.5h5.6M10 19.5l.6-3.1h2.8l.6 3.1"/>',
		pennant: '<path d="M6.5 3.5v17"/><path d="M6.5 4.6l13 3.4-13 4.2z"/>',
		octagon: '<path d="M8.2 4.5h7.6l4.2 4.2v6.6l-4.2 4.2H8.2L4 15.3V8.7z"/><path d="M12 8.5v7M9 12h6"/>',
		globe: '<circle cx="12" cy="12" r="9.2"/><path d="M2.8 12h18.4M12 2.8c3.2 3.4 3.2 15 0 18.4M12 2.8c-3.2 3.4-3.2 15 0 18.4M4.6 6.4c4.4 2.4 10.4 2.4 14.8 0M4.6 17.6c4.4-2.4 10.4-2.4 14.8 0"/>'
	};
	/* slug, icon, label. Drop a real logo at assets/images/leagues/<slug>.svg|png
	   and add its slug to LOGO_FILES below — it replaces the emblem automatically. */
	const LEAGUES = [['nba', 'bball', 'NBA'], ['nfl', 'fball', 'NFL'], ['mlb', 'baseball', 'MLB'], ['nhl', 'hockey', 'NHL'], ['premier-league', 'soccer', 'Premier League'], ['champions-league', 'trophy', 'Champions League'], ['ncaa', 'pennant', 'NCAA'], ['ufc', 'octagon', 'UFC'], ['world-cup', 'globe', 'World Cup']];
	/* Auto-load a real logo if a file exists at assets/images/leagues/<slug>.svg
	   (falls back to .png, then to the emblem). Just drop the files in. */
	const LOGO_DIR = 'assets/images/leagues/';
	const onErr = "if(this.dataset.t!=='png'){this.dataset.t='png';this.src=this.src.replace(/\\.svg$/,'.png')}else{this.remove()}";
	document.querySelectorAll('[data-leagues]').forEach((row) => {
		const item = ([slug, ic, name]) =>
			`<span class="lg"><span class="lg__mk"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[ic]}</svg>` +
			`<img class="lg__img" src="${LOGO_DIR}${slug}.svg" alt="" onload="this.classList.add('on')" onerror="${onErr}"></span><b>${name}</b></span>`;
		const set = LEAGUES.map(item).join('');
		row.innerHTML = set + set; /* duplicate for seamless loop */
	});

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
		const storyDev = story.querySelector('.story__device .device');
		let ticking = false;
		const onStory = () => {
			if (ticking || isMobile()) return;
			ticking = true;
			requestAnimationFrame(() => {
				const total = story.offsetHeight - window.innerHeight;
				const p = clamp(-story.getBoundingClientRect().top / total, 0, 1);
				set(p < 0.34 ? 0 : p < 0.68 ? 1 : 2);
				/* starts turned away, rotates to face you as you scroll in */
				if (storyDev && !reduce) {
					const ry = (-26 + p * 28).toFixed(2);   /* -26deg → +2deg */
					const rx = (7 - p * 6).toFixed(2);       /* 7deg → 1deg */
					storyDev.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
				}
				ticking = false;
			});
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
				w.querySelectorAll('.device__screen').forEach(chrome);
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
