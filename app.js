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
	const K = '#0a0a0c'; /* knock-out detail = page black */
	const ICONS = {
		bball: `<circle cx="12" cy="12" r="10" fill="#f5f5f7"/><g fill="none" stroke="${K}" stroke-width="1.4" stroke-linecap="round"><path d="M12 2v20M2 12h20M5.2 5.2c4 3.9 4 9.7 0 13.6M18.8 5.2c-4 3.9-4 9.7 0 13.6"/></g>`,
		fball: `<g transform="rotate(-34 12 12)"><path fill="#f5f5f7" d="M12 5.4c4.1 0 7.4 2.96 7.4 6.6s-3.3 6.6-7.4 6.6-7.4-2.96-7.4-6.6S7.9 5.4 12 5.4z"/><g fill="none" stroke="${K}" stroke-width="1.3" stroke-linecap="round"><path d="M8.6 12h6.8M10.6 10.7v2.6M12 10.3v3.4M13.4 10.7v2.6"/></g></g>`,
		baseball: `<circle cx="12" cy="12" r="10" fill="#f5f5f7"/><g fill="none" stroke="${K}" stroke-width="1.3" stroke-linecap="round"><path d="M6.6 4.2c2.7 3.2 2.7 9.6 0 13.6M17.4 4.2c-2.7 3.2-2.7 9.6 0 13.6"/></g>`,
		hockey: `<ellipse cx="12" cy="10.5" rx="8.6" ry="3.2" fill="#f5f5f7"/><path fill="#bfbfc6" d="M3.4 10.5v3.4c0 1.77 3.85 3.2 8.6 3.2s8.6-1.43 8.6-3.2v-3.4c0 1.77-3.85 3.2-8.6 3.2s-8.6-1.43-8.6-3.2z"/>`,
		soccer: `<circle cx="12" cy="12" r="10" fill="#f5f5f7"/><path fill="${K}" d="M12 8.1l3.05 2.2-1.16 3.6h-3.78L9 10.3z"/><g fill="none" stroke="${K}" stroke-width="1.2" stroke-linecap="round"><path d="M12 8V4M15 10.3l3.3-1.3M13.9 13.9l1.9 3M10.1 13.9l-1.9 3M9 10.3L5.7 9"/></g>`,
		trophy: `<path fill="#f5f5f7" d="M8 4h8v3.2a4 4 0 0 1-8 0V4z"/><path fill="none" stroke="#f5f5f7" stroke-width="1.6" d="M8 5.2H5.4A2.6 2.6 0 0 0 8 7.8M16 5.2h2.6A2.6 2.6 0 0 1 16 7.8"/><rect x="10.9" y="11" width="2.2" height="3.4" fill="#f5f5f7"/><path fill="#f5f5f7" d="M8.4 19l.7-3.4h5.8l.7 3.4z"/>`,
		pennant: `<rect x="5.4" y="3.4" width="1.7" height="17.2" rx=".85" fill="#f5f5f7"/><path fill="#f5f5f7" d="M7.1 4.5l12.5 3.3-12.5 4z"/>`,
		octagon: `<path fill="#f5f5f7" fill-rule="evenodd" d="M7.9 3.4h8.2l4.5 4.5v8.2l-4.5 4.5H7.9l-4.5-4.5V7.9zM8.7 5.4 5.4 8.7v6.6l3.3 3.3h6.6l3.3-3.3V8.7l-3.3-3.3z"/>`,
		globe: `<circle cx="12" cy="12" r="10" fill="#f5f5f7"/><g fill="none" stroke="${K}" stroke-width="1.2"><path d="M2 12h20M12 2c3.5 3.7 3.5 16.3 0 20M12 2c-3.5 3.7-3.5 16.3 0 20M4.6 6c4.7 2.6 11.1 2.6 14.8 0M4.6 18c4.7-2.6 11.1-2.6 14.8 0"/></g>`
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
