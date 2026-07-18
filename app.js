/* ==========================================================================
   PLAYMAKR . PRESS ROW GLASS
   The motion engine.

   Law: an element may only animate the way the thing it depicts actually
   behaves. A score ticks. A notification springs from above. A thread types.
   A marquee carries momentum. Text never animates. Nothing fades up 20px.

   Public API is data-* attributes only. See COMPONENTS.md.
   ========================================================================== */
(() => {
	'use strict';

	/* ---------------------------------------------------------------- 0. env */
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
	const html = document.documentElement;
	html.classList.add('js');
	if (reduce) html.classList.add('no-motion');

	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => [...r.querySelectorAll(s)];
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	const raf = window.requestAnimationFrame.bind(window);

	/* One shared rAF pump for every scroll driven read. One listener, one
	   frame, one write pass. No per section listeners. */
	const pump = (() => {
		const jobs = new Set();
		let queued = false;
		const run = () => { queued = false; jobs.forEach((j) => j()); };
		const kick = () => { if (!queued) { queued = true; raf(run); } };
		window.addEventListener('scroll', kick, { passive: true });
		window.addEventListener('resize', kick, { passive: true });
		return { add: (j) => { jobs.add(j); j(); }, kick };
	})();

	/* --------------------------------------------- 1. the one shared observer
	   Animations play once and never re-run on scroll back. A replaying
	   animation is the loudest AI tell there is. */
	const onceMap = new WeakMap();
	const once = ('IntersectionObserver' in window)
		? new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (!e.isIntersecting) return;
				const fn = onceMap.get(e.target);
				once.unobserve(e.target);
				if (fn) fn(e.target);
			});
		}, { rootMargin: '0px 0px -12% 0px', threshold: 0.35 })
		: null;

	const watch = (el, fn) => {
		if (!el) return;
		if (reduce || !once) { fn(el); return; }
		onceMap.set(el, fn);
		once.observe(el);
	};

	/* Ambient observer. Threads and the marquee are the only things allowed to
	   loop, and they pause when out of view. */
	const ambient = ('IntersectionObserver' in window)
		? new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				const fn = e.target.__pmAmbient;
				if (fn) fn(e.isIntersecting);
			});
		}, { threshold: 0.25 })
		: null;
	const watchAmbient = (el, fn) => {
		if (!el) return;
		el.__pmAmbient = fn;
		if (ambient) ambient.observe(el); else fn(true);
	};

	/* ------------------------------------------------- 2. iOS chrome helpers
	   Injected into every phone screen so a page author never hand writes it. */
	const STATUS = '<div class="ios-status" aria-hidden="true"><span class="ios-time">9:41</span><span class="ios-ind"><i class="ios-sig"></i><i class="ios-wifi"></i><i class="ios-bat"></i></span></div>';
	const INPUT = '<div class="ios-input" aria-hidden="true"><span class="ios-field">Message</span><span class="ios-send"></span></div>';
	const chrome = (screen) => {
		if (screen.dataset.chromed) return;
		screen.dataset.chromed = '1';
		if (screen.dataset.chrome !== 'bare') {
			screen.insertAdjacentHTML('afterbegin', STATUS);
			if (screen.dataset.chrome !== 'no-input') screen.insertAdjacentHTML('beforeend', INPUT);
		}
	};
	$$('.device__screen').forEach(chrome);

	/* -------------------------------------------------------- 3. the light
	   One source, globally agreed. Every rim and every shadow derives from
	   these numbers. Nothing on the page contradicts the light. */
	const litEls = $$('[data-lit]');
	if (litEls.length) {
		const lightPass = () => {
			const lx = window.innerWidth * 0.5;
			const ly = window.innerHeight * -0.14;
			const vh = window.innerHeight;
			litEls.forEach((el) => {
				const r = el.getBoundingClientRect();
				if (r.bottom < -vh || r.top > vh * 2) return; /* far offscreen, skip */
				const cx = r.left + r.width / 2;
				const cy = r.top + r.height / 2;
				const vx = cx - lx;
				const vy = cy - ly;
				const m = Math.hypot(vx, vy) || 1;
				const ux = vx / m, uy = vy / m;
				/* CSS 0deg points up. Gradient progresses away from the light,
				   so the face turned toward the light is the bright one. */
				const deg = Math.atan2(ux, -uy) * 180 / Math.PI;
				el.style.setProperty('--lit-x', ux.toFixed(3));
				el.style.setProperty('--lit-y', uy.toFixed(3));
				el.style.setProperty('--lit-angle', deg.toFixed(1) + 'deg');
				el.style.setProperty('--rim-from', (deg + 180).toFixed(1) + 'deg');
				/* rect derived sample coordinates for the refraction layer.
				   Same pixels as a fixed attachment, none of the hazard. */
				el.style.setProperty('--cx', Math.round(r.left) + 'px');
				el.style.setProperty('--cy', Math.round(r.top) + 'px');
			});
		};
		pump.add(lightPass);
	}

	/* ------------------------------------------------- 4. refraction budget
	   The most expensive paint on the page. Two cards live at once, zero on
	   touch, and the first thing cut. Everything else gets fill and rim, which
	   is visually 90% of the way there. */
	const refractEls = $$('[data-refract]');
	if (refractEls.length && fine) {
		refractEls.forEach((el) => {
			const layer = el.querySelector('.glass__refract');
			if (layer && !layer.querySelector('i')) layer.appendChild(document.createElement('i'));
		});
		const budget = () => {
			const mid = window.innerHeight / 2;
			const ranked = refractEls
				.map((el) => {
					const r = el.getBoundingClientRect();
					const visible = r.bottom > 0 && r.top < window.innerHeight;
					return { el, visible, d: Math.abs(r.top + r.height / 2 - mid) };
				})
				.filter((o) => o.visible)
				.sort((a, b) => a.d - b.d);
			const live = new Set(ranked.slice(0, 2).map((o) => o.el));
			refractEls.forEach((el) => el.classList.toggle('is-refracting', live.has(el)));
		};
		pump.add(budget);
	}

	/* ------------------------------------------------- 5. cursor specular
	   A bright bead runs along the edge under the cursor. The conic stays as
	   ambient. The card itself never tilts. Only light moves. */
	if (fine && !reduce) {
		$$('[data-lit]').forEach((el) => {
			el.addEventListener('pointermove', (e) => {
				const r = el.getBoundingClientRect();
				el.style.setProperty('--specular',
					`radial-gradient(220px circle at ${(e.clientX - r.left).toFixed(0)}px ${(e.clientY - r.top).toFixed(0)}px, rgba(255,255,255,.7), rgba(255,255,255,.05) 45%, transparent 72%)`);
			});
			el.addEventListener('pointerleave', () => el.style.setProperty('--specular', 'transparent'));
		});
	}

	/* ------------------------------------------------------------- 6. nav
	   Condenses between scrollY 0 and 120. At 0 it is genuinely absent.
	   It never refracts: that is the most expensive possible paint. */
	const nav = $('#nav');
	if (nav) {
		let last = -1;
		const navPass = () => {
			const d = clamp(window.scrollY / 120, 0, 1);
			if (Math.abs(d - last) < 0.01 && d !== 0 && d !== 1) return;
			if (d > 0 && d < 1) nav.style.willChange = 'backdrop-filter';
			else nav.style.willChange = '';
			last = d;
			nav.style.setProperty('--depth', d.toFixed(3));
		};
		pump.add(navPass);

		const burger = $('#burger');
		burger && burger.addEventListener('click', () => {
			const open = nav.classList.toggle('is-open');
			burger.setAttribute('aria-expanded', String(open));
		});
		$$('.nav__mobile a', nav).forEach((a) => a.addEventListener('click', () => {
			nav.classList.remove('is-open');
			burger && burger.setAttribute('aria-expanded', 'false');
		}));
	}

	/* --------------------------------------------------- 7. the scrim driver
	   One property, one write per frame, one paint layer. Purple concentrates
	   at the CTA. --scrim-cut composes with the breathe animation on #field. */
	const scrimTarget = $('[data-scrim]');
	if (scrimTarget && !reduce) {
		const scrimPass = () => {
			const r = scrimTarget.getBoundingClientRect();
			const vh = window.innerHeight;
			/* 0 when the target is a full viewport away, 1 once it is here. */
			const p = clamp(1 - (r.top - vh * 0.2) / (vh * 0.9), 0, 1);
			html.style.setProperty('--scrim-cut', (p * 0.05).toFixed(4));
		};
		pump.add(scrimPass);
	}

	/* ---------------------------------------------------- 8. digit rollers
	   Every digit is a column. Only the digits that changed move. One numeric
	   signature, reused by the island, the score card and the counter. */
	const buildRoll = (host, str) => {
		host.textContent = '';
		[...str].forEach((ch) => {
			if (!/\d/.test(ch)) {
				const sep = document.createElement('span');
				sep.className = 'sep';
				sep.textContent = ch;
				host.appendChild(sep);
				return;
			}
			const r = document.createElement('span');
			r.className = 'roll';
			const c = document.createElement('span');
			c.className = 'roll__col';
			c.textContent = '0123456789';
			c.style.setProperty('--d', ch);
			r.appendChild(c);
			host.appendChild(r);
		});
		host.dataset.rollValue = str;
	};

	/* setRoll(host, value, animate). Rebuilds only when the shape changes.
	   Otherwise it moves the changed columns alone, staggered from the right. */
	const setRoll = (host, value, animate) => {
		const str = String(value);
		const prev = host.dataset.rollValue;
		if (prev === undefined || prev.length !== str.length || !animate || reduce) {
			buildRoll(host, str);
			return;
		}
		const cols = $$('.roll__col', host);
		let ci = 0;
		const changed = [];
		[...str].forEach((ch, i) => {
			if (!/\d/.test(ch)) return;
			const col = cols[ci++];
			if (!col) return;
			if (prev[i] !== ch) changed.push({ col, ch });
		});
		/* stagger from the right */
		changed.reverse().forEach((o, n) => {
			o.col.classList.add('is-rolling');
			o.col.style.transitionDelay = (n * 45) + 'ms';
			o.col.style.setProperty('--d', o.ch);
		});
		host.dataset.rollValue = str;
	};

	/* [data-roll] = the resting value. [data-tick] = comma list of values it
	   ticks through once the card is in view. A score ticks. */
	$$('[data-roll]').forEach((host) => {
		const start = host.dataset.roll;
		buildRoll(host, start);
		const ticks = (host.dataset.tick || '').split(',').map((s) => s.trim()).filter(Boolean);
		if (!ticks.length) return;
		if (reduce) { buildRoll(host, ticks[ticks.length - 1]); settleSection(host); return; }
		watch(host, () => {
			let i = 0;
			const next = () => {
				if (i >= ticks.length) { settleSection(host); return; }
				setRoll(host, ticks[i++], true);
				setTimeout(next, 2200);
			};
			setTimeout(next, 1400);
		});
	});

	/* --------------------------------------------------- 9. the green period
	   The only color change on the entire page. A full stop that is green
	   means the game is still going. */
	function settleSection(from) {
		const sec = from.closest('.sec, .hero, section');
		if (!sec) return;
		$$('.stop[data-live="settle"]', sec).forEach((s) => {
			s.classList.remove('is-live');
			s.classList.add('is-settled');
		});
	}
	$$('.stop[data-live]').forEach((stop) => {
		if (reduce) { stop.classList.add('is-live'); return; }
		watch(stop, () => stop.classList.add('is-live'));
	});

	/* ----------------------------------------------- 10. panels and entrances
	   Light arrives, content does not. The content inside is already there at
	   full opacity. That is the anti slop tell. */
	$$('[data-panel]').forEach((p) => watch(p, (el) => el.classList.add('is-in')));
	$$('.notif[data-notif]').forEach((n) => watch(n, (el) => el.classList.add('is-in')));
	$$('.bar__fill[data-bar]').forEach((b) => watch(b, (el) => el.classList.add('is-in')));

	/* ------------------------------------------------------- 11. the island
	   Inside the phone frame only. Never at page level. */
	$$('[data-island]').forEach((island) => {
		const mode = island.dataset.island;
		if (!mode) return;
		if (reduce) { island.classList.add('is-live'); return; }
		const host = island.closest('.device') || island;
		watch(host, () => {
			setTimeout(() => island.classList.add('is-live'), 900);
			if (mode === 'alert') {
				setTimeout(() => island.classList.add('is-alert'), 3400);
				setTimeout(() => island.classList.remove('is-alert'), 7400);
			}
		});
	});

	/* ---------------------------------------------------- 12. status chips
	   Questionable to OUT. The card's own color bleeds into its light. */
	$$('[data-status]').forEach((chip) => {
		const to = chip.dataset.status;
		if (!to) return;
		if (reduce) { chip.textContent = to; chip.classList.add('is-out'); return; }
		watch(chip, () => setTimeout(() => {
			chip.textContent = to;
			chip.classList.add('is-out');
			const card = chip.closest('.alert, .card');
			card && card.classList.add('is-out');
		}, 1800));
	});

	/* -------------------------------------------------------- 13. the thread
	   Types itself, in view only, on a loop. Every bubble above a new arrival
	   moves via a real FLIP measure, so the stack has weight, not reflow. */
	$$('[data-thread]').forEach((thread) => {
		const msgs = $$('.b', thread);
		if (!msgs.length) return;
		if (reduce) { msgs.forEach((m) => m.classList.add('is-settled')); return; }

		const typing = document.createElement('div');
		typing.className = 'typing';
		typing.setAttribute('aria-hidden', 'true');
		typing.innerHTML = '<span></span><span></span><span></span>';

		/* A real first / last / invert / play over everything already in the
		   stack. Never a layout reflow. */
		const flip = (mutate) => {
			const nodes = [...msgs, typing].filter((n) => n.parentNode && n.style.display !== 'none');
			const first = new Map();
			nodes.forEach((n) => first.set(n, n.getBoundingClientRect().top));
			mutate();
			nodes.forEach((n) => {
				if (!n.parentNode) return;
				const dy = first.get(n) - n.getBoundingClientRect().top;
				if (!dy) return;
				n.classList.remove('is-flip');
				n.style.transform = 'translateY(' + dy + 'px)';
				raf(() => {
					n.classList.add('is-flip');
					n.style.transform = '';
				});
			});
		};

		msgs.forEach((m) => {
			m.style.display = 'none';
			/* Hand the bubble off from the spring to a plain settled state, so
			   a later FLIP transform is not fighting an animation fill. */
			m.addEventListener('animationend', () => {
				if (!m.classList.contains('msg-in')) return;
				m.classList.remove('msg-in');
				m.classList.add('is-settled');
			});
		});

		let i = 0, alive = false, timer = null;
		const wait = (fn, ms) => { timer = setTimeout(fn, ms); };

		const reveal = (m) => {
			flip(() => {
				if (typing.parentNode) typing.parentNode.removeChild(typing);
				m.style.display = '';
				m.classList.add('msg-in');
			});
			i++;
			wait(step, m.classList.contains('b--out') ? 680 : 900);
		};

		const step = () => {
			if (!alive) return;
			if (i >= msgs.length) { wait(reset, 3000); return; }
			const m = msgs[i];
			if (m.classList.contains('b--out')) {
				wait(() => reveal(m), 140);
			} else {
				/* The agent takes longer to fetch a number. That beat is the
				   characterization, so a score card waits 1250. */
				flip(() => thread.appendChild(typing));
				wait(() => reveal(m), m.classList.contains('b--card') ? 1250 : 1050);
			}
		};

		const reset = () => {
			if (typing.parentNode) typing.parentNode.removeChild(typing);
			msgs.forEach((m) => {
				m.style.display = 'none';
				m.style.transform = '';
				m.classList.remove('msg-in', 'is-settled', 'is-flip');
			});
			i = 0;
			wait(step, 500);
		};

		watchAmbient(thread, (on) => {
			if (on && !alive) { alive = true; wait(step, 500); }
			else if (!on && alive) { alive = false; clearTimeout(timer); }
		});
	});

	/* ------------------------------------------------------ 14. the marquee
	   Real momentum, never a linear CSS loop. A velocity integrator that a
	   wheel can push and a pointer can throw. */
	const K = '#0a0a0c'; /* knock out detail = page black */
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
	/* slug, icon, label. Drop a real logo at assets/images/leagues/<slug>.svg
	   and list its slug in manifest.json. It replaces the emblem automatically. */
	const LEAGUES = [['nba', 'bball', 'NBA'], ['nfl', 'fball', 'NFL'], ['mlb', 'baseball', 'MLB'], ['nhl', 'hockey', 'NHL'], ['premier-league', 'soccer', 'Premier League'], ['champions-league', 'trophy', 'Champions League'], ['ncaa', 'pennant', 'NCAA'], ['ufc', 'octagon', 'UFC'], ['world-cup', 'globe', 'World Cup']];
	const LOGO_DIR = 'assets/images/leagues/';

	const leagueRows = $$('[data-leagues]');
	if (leagueRows.length) {
		leagueRows.forEach((row) => {
			const item = ([slug, ic, name]) =>
				`<span class="lg" data-slug="${slug}"><span class="lg__mk"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[ic]}</svg></span><b>${name}</b></span>`;
			const set = LEAGUES.map(item).join('');
			row.innerHTML = set + set; /* doubled for the seamless wrap */
		});
		/* Only listed files are ever requested, so there is no 404 noise for
		   absent logos. manifest.json will not fetch over file://, and the
		   catch already handles it: the SVG emblems simply remain. */
		fetch(LOGO_DIR + 'manifest.json?v=6').then((r) => (r.ok ? r.json() : [])).then((list) => {
			(Array.isArray(list) ? list : []).forEach((e) => {
				const slug = typeof e === 'string' ? e : e && e.slug;
				if (!slug) return;
				const file = (e && e.file) ? e.file : slug + '.svg';
				$$(`.lg[data-slug="${slug}"] .lg__mk`).forEach((mk) => {
					const img = document.createElement('img');
					img.className = 'lg__img';
					img.alt = '';
					img.src = LOGO_DIR + file + '?v=6';
					img.onload = () => img.classList.add('on');
					mk.appendChild(img);
				});
			});
		}).catch(() => {});
	}

	$$('.marquee').forEach((mq) => {
		const row = $('.marquee__row', mq);
		if (!row) return;
		if (reduce) return; /* static row, velocity 0 */

		const BASE = -0.42;
		const HOVER = -0.12;
		let base = BASE, baseTo = BASE;
		let vel = BASE, x = 0, half = 0, on = false, running = false;
		let dragging = false, lastX = 0, dragV = 0;

		const measure = () => { half = row.scrollWidth / 2; };
		measure();
		window.addEventListener('resize', measure, { passive: true });

		const frame = () => {
			if (!running) return;
			base += (baseTo - base) * 0.08; /* eases to be read, never stops dead */
			if (dragging) {
				vel = dragV;
				dragV *= 0.6;
			} else {
				vel = base + (vel - base) * 0.94; /* decays back toward base */
			}
			x += vel;
			if (half) {
				while (x <= -half) x += half;
				while (x > 0) x -= half;
			}
			row.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
			raf(frame);
		};

		mq.addEventListener('wheel', (e) => {
			vel += (e.deltaX || e.deltaY) * -0.04;
		}, { passive: true });

		mq.addEventListener('pointerenter', () => { baseTo = HOVER; });
		mq.addEventListener('pointerleave', () => { baseTo = BASE; });

		mq.addEventListener('pointerdown', (e) => {
			dragging = true; lastX = e.clientX; dragV = 0;
			mq.setPointerCapture(e.pointerId);
		});
		mq.addEventListener('pointermove', (e) => {
			if (!dragging) return;
			dragV = e.clientX - lastX;
			lastX = e.clientX;
		});
		const release = () => {
			if (!dragging) return;
			dragging = false;
			vel = clamp(dragV, -60, 60); /* the throw */
		};
		mq.addEventListener('pointerup', release);
		mq.addEventListener('pointercancel', release);

		watchAmbient(mq, (vis) => {
			on = vis;
			if (on && !running) { running = true; measure(); raf(frame); }
			else if (!on) running = false;
		});
	});

	/* ---------------------------------------------------- 15. the counter
	   Rolls. It never counts via textContent and it never idles. */
	const wlNum = $('[data-count]');
	if (wlNum) {
		const START = parseInt(wlNum.dataset.count, 10) || 7000;
		const EPOCH = Date.parse('2026-07-01T00:00:00Z');
		const PERIOD = 3 * 60 * 60 * 1000; /* baseline drift, a touch higher each day */
		/* The drift is capped. Uncapped it compounds forever and the number
		   stops being the ~7,000 it is supposed to read as. */
		const DRIFT_MAX = 300;
		const drift = Math.min(DRIFT_MAX, Math.max(0, Math.floor((Date.now() - EPOCH) / PERIOD)));
		let count = START + drift;
		const fmt = (n) => Math.round(n).toLocaleString('en-US');

		let ticking = false;
		/* Capped per session for the same reason as the drift: a tab left open
		   should not climb the number into fiction. */
		const SESSION_MAX = 12;
		let grown = 0;
		const grow = () => {
			if (reduce) return;
			ticking = true;
			const loop = () => {
				if (grown >= SESSION_MAX) return;
				grown += 1;
				count += 1;
				setRoll(wlNum, fmt(count), true);
				setTimeout(loop, 6500 + Math.random() * 8000); /* a join every 6 to 14s */
			};
			setTimeout(loop, 4000 + Math.random() * 4000);
		};

		if (reduce) {
			buildRoll(wlNum, fmt(count));
		} else {
			buildRoll(wlNum, fmt(Math.max(0, count - 220)));
			watch(wlNum, () => {
				setRoll(wlNum, fmt(count), true);
				setTimeout(() => { if (!ticking) grow(); }, 900);
			});
		}

		/* role picker. The verified badge is reserved for athletes and creators. */
		let role = 'fan';
		const sec = wlNum.closest('.wl, .sec, section') || document;
		$$('.role', sec).forEach((btn) => btn.addEventListener('click', () => {
			role = btn.dataset.role;
			$$('.role', sec).forEach((b) => {
				const isOn = b === btn;
				b.classList.toggle('is-on', isOn);
				b.setAttribute('aria-checked', String(isOn));
			});
			sec.classList && sec.classList.toggle('is-vip', role !== 'fan');
		}));

		/* join by phone number, logged to Kit with the phone field plus role */
		const KITF = 'https://app.kit.com/forms/9578491/subscriptions';
		const form = $('[data-waitlist]', sec);
		form && form.addEventListener('submit', (e) => {
			e.preventDefault();
			const input = $('input[type="tel"]', form);
			const btn = $('button[type="submit"]', form);
			const cap = $('.capture', form);
			const msg = $('.capture__msg', form);
			const digits = (input.value || '').replace(/\D/g, '');
			if (digits.length < 10) {
				input.setCustomValidity('Enter a valid phone number');
				input.reportValidity();
				setTimeout(() => input.setCustomValidity(''), 10);
				return;
			}
			const phone = digits.length === 10 ? '+1' + digits : '+' + digits;
			if (btn) btn.disabled = true;
			const fd = new FormData();
			fd.append('email_address', digits + '@sms.playmakr.pro'); /* placeholder key, the real value is the phone field */
			fd.append('fields[phone_number]', phone);
			fd.append('fields[role]', role);
			fetch(KITF, { method: 'POST', body: fd, mode: 'no-cors' }).catch(() => {});
			count += 1;
			setRoll(wlNum, fmt(count), true);
			if (cap) cap.classList.add('is-done');
			const badge = role !== 'fan' ? " We'll review you for a verified badge." : '';
			if (msg) msg.textContent = `You're on the list. We'll text you the moment access opens.${badge}`;
			input.value = '';
			input.disabled = true;
			if (btn) btn.textContent = 'Joined';
		});
	}

	/* ------------------------------------------------------ 16. clip lightbox
	   The href is a real link to YouTube and stays the fallback. */
	const videoEls = $$('[data-video]');
	if (videoEls.length) {
		let lb = null;
		const close = () => {
			if (!lb) return;
			lb.classList.remove('open');
			$('.lightbox__video', lb).innerHTML = '';
			document.body.style.overflow = '';
		};
		const open = (id) => {
			if (!lb) {
				lb = document.createElement('div');
				lb.className = 'lightbox';
				lb.innerHTML = '<button class="lightbox__close" aria-label="Close video"></button><div class="lightbox__frame"><div class="lightbox__video"></div></div>';
				document.body.appendChild(lb);
				lb.addEventListener('click', (e) => {
					if (e.target === lb || e.target.closest('.lightbox__close')) close();
				});
			}
			$('.lightbox__video', lb).innerHTML =
				'<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" title="Highlights" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
			lb.classList.add('open');
			document.body.style.overflow = 'hidden';
		};
		document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
		videoEls.forEach((el) => el.addEventListener('click', (e) => {
			e.preventDefault();
			open(el.dataset.video);
		}));
	}
})();

/* ==========================================================================
   AMBIENT FIELD . very slight mouse parallax
   The background glow drifts a few px toward the pointer and eases back, so the
   page feels alive without ever calling attention to itself. Fine pointers only,
   and fully off under prefers-reduced-motion.
   ========================================================================== */
(() => {
	'use strict';
	const field = document.getElementById('field');
	if (!field) return;
	const fine = window.matchMedia('(pointer: fine)').matches;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!fine || reduce) return;

	const MAX = 12;            /* px of drift at the very edge — deliberately tiny */
	let tx = 0, ty = 0;        /* target */
	let cx = 0, cy = 0;        /* current (eased) */
	let running = false;

	const frame = () => {
		/* ease toward target; the lag is what reads as a soft "jiggle" */
		cx += (tx - cx) * 0.06;
		cy += (ty - cy) * 0.06;
		field.style.setProperty('--fx', cx.toFixed(2) + 'px');
		field.style.setProperty('--fy', cy.toFixed(2) + 'px');
		if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
			requestAnimationFrame(frame);
		} else {
			running = false;
		}
	};
	const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

	window.addEventListener('pointermove', (e) => {
		const nx = (e.clientX / window.innerWidth) * 2 - 1;   /* -1 .. 1 */
		const ny = (e.clientY / window.innerHeight) * 2 - 1;
		tx = nx * MAX;
		ty = ny * MAX;
		kick();
	}, { passive: true });
})();
