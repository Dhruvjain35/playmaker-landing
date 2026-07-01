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
	const LOGO_DIR = 'assets/images/leagues/';
	document.querySelectorAll('[data-leagues]').forEach((row) => {
		const item = ([slug, ic, name]) =>
			`<span class="lg" data-slug="${slug}"><span class="lg__mk"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[ic]}</svg></span><b>${name}</b></span>`;
		const set = LEAGUES.map(item).join('');
		row.innerHTML = set + set; /* duplicate for seamless loop */
	});
	/* Real logos: list slugs (or {slug,file}) in assets/images/leagues/manifest.json.
	   Only listed files are ever requested, so there's no 404 noise for absent logos. */
	fetch(LOGO_DIR + 'manifest.json').then((r) => (r.ok ? r.json() : [])).then((list) => {
		(Array.isArray(list) ? list : []).forEach((e) => {
			const slug = typeof e === 'string' ? e : e && e.slug;
			if (!slug) return;
			const file = (e && e.file) ? e.file : slug + '.svg';
			document.querySelectorAll(`.lg[data-slug="${slug}"] .lg__mk`).forEach((mk) => {
				const img = document.createElement('img');
				img.className = 'lg__img'; img.alt = ''; img.src = LOGO_DIR + file;
				img.onload = () => img.classList.add('on');
				mk.appendChild(img);
			});
		});
	}).catch(() => {});

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

	/* reveals + steps draw-line */
	const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
		entries.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add('is-in'); io.unobserve(e.target); });
	}, { threshold: 0.2, rootMargin: '0px 0px -7% 0px' }) : null;
	const watch = document.querySelectorAll('[data-reveal], .steps');
	if (reduce || !io) watch.forEach((el) => el.classList.add('is-in'));
	else watch.forEach((el) => io.observe(el));

	/* ── live waitlist counter: real & persistent (counterapi.dev), emails + numbers logged to Kit ── */
	const wlCounter = document.querySelector('.counter[data-goal]');
	if (wlCounter) {
		const API = 'https://api.counterapi.dev/v1/playmakr-pro/waitlist';
		const KITF = 'https://app.kit.com/forms/9578491/subscriptions';
		const GOAL = +wlCounter.dataset.goal || 10000;
		const BASE = +wlCounter.dataset.base || 0;   /* set data-base to your real existing signups */
		const odo = wlCounter.querySelector('[data-odo]');
		const barFill = wlCounter.querySelector('.bar__fill');
		const setBar = (n) => { if (barFill) barFill.style.width = Math.max(1.5, Math.min(100, (n / GOAL) * 100)) + '%'; };
		const render = (n, animate) => {
			const str = Math.max(0, Math.round(n)).toLocaleString('en-US');
			odo.innerHTML = ''; let di = 0;
			[...str].forEach((ch) => {
				if (ch === ',') { const s = document.createElement('span'); s.className = 'odo__sep'; s.textContent = ','; odo.appendChild(s); return; }
				const d = document.createElement('span'); d.className = 'odo__d';
				const col = document.createElement('div'); col.className = 'odo__col'; const cycles = 4;
				for (let c = 0; c < cycles; c++) for (let i = 0; i < 10; i++) { const sp = document.createElement('span'); sp.textContent = i; col.appendChild(sp); }
				d.appendChild(col); odo.appendChild(d);
				const offset = (cycles - 1) * 10 + (+ch); di++;
				if (animate && !reduce) { col.style.transitionDelay = (di * 0.05) + 's'; requestAnimationFrame(() => requestAnimationFrame(() => { col.style.transform = `translateY(-${offset}em)`; })); }
				else { col.style.transition = 'none'; col.style.transform = `translateY(-${offset}em)`; }
			});
		};
		let current = BASE, fetched = false, seen = false;
		const paint = () => { if (fetched && seen) render(current, true), setBar(current); };
		fetch(API + '/').then((r) => r.json()).then((j) => { current = BASE + ((j && j.count) || 0); }).catch(() => {}).finally(() => { fetched = true; paint(); });
		if ('IntersectionObserver' in window) { const o = new IntersectionObserver((en, ob) => en.forEach((e) => { if (e.isIntersecting) { seen = true; paint(); ob.disconnect(); } }), { threshold: 0.35 }); o.observe(wlCounter); }
		else { seen = true; paint(); }

		/* role picker — the verified badge is only for athletes & creators */
		let role = 'fan';
		const sec = wlCounter.closest('.wl') || document;
		sec.querySelectorAll('.role').forEach((btn) => btn.addEventListener('click', () => {
			role = btn.dataset.role;
			sec.querySelectorAll('.role').forEach((b) => { const on = b === btn; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
			sec.classList && sec.classList.toggle('is-vip', role !== 'fan');
		}));

		/* submit — increment the real counter, log email + number + role to Kit */
		const form = sec.querySelector('[data-waitlist]');
		form && form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const input = form.querySelector('input[type="email"]');
			const btn = form.querySelector('button[type="submit"]');
			const cap = form.querySelector('.capture');
			const msg = form.querySelector('.capture__msg');
			if (!input.checkValidity()) { input.reportValidity(); return; }
			const email = input.value.trim();
			if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
			let n = current + 1;
			try { const r = await fetch(API + '/up'); const j = await r.json(); if (j && j.count) n = BASE + j.count; } catch (_) {}
			current = n;
			const fd = new FormData();
			fd.append('email_address', email);
			fd.append('fields[waitlist_number]', n);
			fd.append('fields[role]', role);
			fetch(KITF, { method: 'POST', body: fd, mode: 'no-cors' }).catch(() => {});
			render(n, true); setBar(n);
			if (cap) cap.classList.add('is-done');
			const badge = role !== 'fan' ? ' Your verified badge is pending review.' : '';
			if (msg) msg.textContent = `You're #${n.toLocaleString('en-US')} on the waitlist.${badge}`;
			input.value = ''; input.disabled = true;
			if (btn) btn.textContent = 'Secured';
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

	/* ── home hero: scroll choreography (phone recedes + tilts, copy parallaxes) ── */
	const heroStage = document.querySelector('.hero__stage');
	const heroCopy = document.querySelector('.hero__copy');
	if (heroStage && !reduce) {
		let ht = false;
		const onHero = () => {
			if (ht) return; ht = true;
			requestAnimationFrame(() => {
				if (window.innerWidth > 900) {
					const p = clamp(window.scrollY / (window.innerHeight * 0.92), 0, 1);
					heroStage.style.transform = `translate3d(0,${(-p * 64).toFixed(1)}px,0) scale(${(1 - p * 0.07).toFixed(3)}) perspective(1000px) rotateX(${(p * 8).toFixed(1)}deg)`;
					if (heroCopy) { heroCopy.style.transform = `translate3d(0,${(p * 46).toFixed(1)}px,0)`; heroCopy.style.opacity = (1 - p * 0.85).toFixed(2); }
				} else if (heroStage.style.transform) {
					heroStage.style.transform = ''; if (heroCopy) { heroCopy.style.transform = ''; heroCopy.style.opacity = ''; }
				}
				ht = false;
			});
		};
		onHero();
		window.addEventListener('scroll', onHero, { passive: true });
		window.addEventListener('resize', onHero, { passive: true });
	}

	/* ── consistent depth parallax on decorative glows (uses independent translate) ── */
	const parEls = [...document.querySelectorAll('[data-parallax]')];
	if (parEls.length && !reduce) {
		let pt = false;
		const par = () => {
			if (pt) return; pt = true;
			requestAnimationFrame(() => {
				const vh = window.innerHeight;
				parEls.forEach((el) => {
					const sp = parseFloat(el.dataset.parallax) || 0.07;
					const r = el.getBoundingClientRect();
					const off = r.top + r.height / 2 - vh / 2;
					el.style.translate = '0 ' + (off * -sp).toFixed(1) + 'px';
				});
				pt = false;
			});
		};
		par();
		window.addEventListener('scroll', par, { passive: true });
		window.addEventListener('resize', par, { passive: true });
	}

	/* ── live thread: agent types and messages arrive, on a loop ── */
	document.querySelectorAll('[data-thread]').forEach((thread) => {
		const msgs = [...thread.querySelectorAll('.b')];
		if (!msgs.length) return;
		if (reduce) { msgs.forEach((m) => m.classList.add('msg-in')); return; }
		const typing = document.createElement('div');
		typing.className = 'typing'; typing.setAttribute('aria-hidden', 'true');
		typing.innerHTML = '<span></span><span></span><span></span>';
		const hideTyping = () => { if (typing.parentNode) typing.parentNode.removeChild(typing); };
		msgs.forEach((m) => { m.style.display = 'none'; });
		let i = 0;
		const reveal = (m) => {
			m.style.display = '';
			m.classList.add('msg-in');
			i++;
			setTimeout(step, m.classList.contains('b--out') ? 680 : 900);
		};
		const step = () => {
			if (i >= msgs.length) { setTimeout(reset, 3000); return; }
			const m = msgs[i];
			if (m.classList.contains('b--out')) {
				setTimeout(() => reveal(m), 140);
			} else {
				thread.appendChild(typing);            /* agent is typing… */
				setTimeout(() => { hideTyping(); reveal(m); }, m.classList.contains('b--card') ? 1250 : 1050);
			}
		};
		const reset = () => {
			hideTyping();
			msgs.forEach((m) => { m.style.display = 'none'; m.classList.remove('msg-in'); });
			i = 0; setTimeout(step, 500);
		};
		/* play only while in view */
		if ('IntersectionObserver' in window) {
			let started = false;
			const o = new IntersectionObserver((en) => en.forEach((e) => {
				if (e.isIntersecting && !started) { started = true; setTimeout(step, 500); }
			}), { threshold: 0.3 });
			o.observe(thread);
		} else { setTimeout(step, 500); }
	});

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

	/* ── video lightbox (real YouTube highlight) ── */
	const videoEls = document.querySelectorAll('[data-video]');
	if (videoEls.length) {
		let lb = null;
		const close = () => {
			if (!lb) return;
			lb.classList.remove('open');
			lb.querySelector('.lightbox__video').innerHTML = '';
			document.body.style.overflow = '';
		};
		const open = (id) => {
			if (!lb) {
				lb = document.createElement('div');
				lb.className = 'lightbox';
				lb.innerHTML = '<button class="lightbox__close" aria-label="Close video">×</button><div class="lightbox__frame"><div class="lightbox__video"></div></div>';
				document.body.appendChild(lb);
				lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lightbox__close')) close(); });
			}
			lb.querySelector('.lightbox__video').innerHTML =
				'<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" title="Highlights" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
			lb.classList.add('open');
			document.body.style.overflow = 'hidden';
		};
		document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
		videoEls.forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); open(el.dataset.video); }));
	}

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
