# PLAYMAKR landing site

Static GitHub Pages site for `playmakr.pro`.

The current build is a premium, product-led landing experience inspired by the composition of
Interfere: a dark cinematic first fold, large confident type, dense console-style product
mockups, restrained controls, and arena lighting built from the existing PLAYMAKR assets.

```text
index.html      Home page
product.html    Product narrative
coverage.html   League and team coverage
waitlist.html   Private beta access form
styles.css      Shared design system and layout
app.js          Nav, reveal animation, and waitlist UI
assets/images   Brand and supporting imagery
CNAME           GitHub Pages custom domain: playmakr.pro
```

## Preview

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8081
```

Then visit `http://127.0.0.1:8081/`.

## Deployment

The site is published with GitHub Pages from the repository root. `CNAME` is set to
`playmakr.pro`.
