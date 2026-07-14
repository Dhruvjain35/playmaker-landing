# PLAYMAKR — landing site

A full rebuild of the PLAYMAKR landing page, styled after [tryclean.ai](https://www.tryclean.ai/)'s
design language: near-black canvas, warm off-white text, **Instrument Serif** display with
italic emphasis, **Space Grotesk** uppercase eyebrows, **Geist** body, **JetBrains Mono** for
scores/stats, and a single blue accent. No frameworks, no build step, no tracking.

```
index.html   — markup (all sections)
styles.css   — design system + every component
app.js        — sticky nav, mobile menu, scroll reveals, email-capture stub
assets/images — drop real photos here (see slots below)
```

## Preview

Open `index.html` directly, or serve it:

```bash
cd playmakr-clean
python3 -m http.server 8080      # → http://localhost:8080
```

## Dropping in real images

The site is complete with **gradient placeholders** today — every image slot reads correctly
with no photo. To swap in real art, add the file and uncomment the matching `background-image`
rule in `styles.css` (each is commented inline):

| Slot                | Where                | Suggested shot                    |
|---------------------|----------------------|-----------------------------------|
| `.hero__media`      | hero background      | floodlit arena / court at dusk    |
| `.final__media`     | final CTA background  | fans under stadium lights         |
| `.merch__media`     | movement section      | the Origin Hoodie product shot    |
| `.fcard__media`     | three feature cards   | per-card photo (see `[data-img]`) |

For per-card photos, use the documented block at the bottom of `styles.css`, e.g.
`.fcard:nth-child(1) .fcard__media { background-image: url("assets/images/ask.jpg"); ... }`.

## Wiring the email forms

`app.js` handles the early-access / giveaway forms as a front-end stub (shows a success state).
The original PLAYMAKR used PocketBase — point the `submit` handler in `app.js` at your endpoint
to persist signups.

## Placeholder copy to confirm

- "5,000+ fans already in the feed" — invented social-proof number; set to your real count.
- Score lines / player stats in the mockups (Cavs/Celtics, Mitchell, Wemby) are illustrative.
