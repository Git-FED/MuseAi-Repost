# Muse AI Repost — Signal Relay Promo Site

A self-contained static site package designed for GitHub Pages or Cloudflare Pages/Workers static hosting. It needs no build step, server runtime, API keys, or Manus website.

## Pages

- `index.html` — animated dark signal-relay homepage.
- `pages/how-it-works.html` — real HTML page explaining the three-step relay.
- `pages/promo-kit.html` — real HTML gallery for the original promotion graphics.
- `pages/platform-rules.html` — real HTML page containing the operating guardrails.

All visible navigation buttons and calls-to-action point to HTML documents. Asset links are local relative paths, so the package works from a GitHub Pages project path as well as a Cloudflare Pages root.

## Visual assets

- `assets/favicon.svg` — symbol-only favicon; it uses the relay-eye mark, not a letter.
- `assets/logo-mark.svg` — reusable symbol logo.
- `assets/promo-hero.png` — cinematic signal-relay hero banner.
- `assets/banner-source-target.png` — source-to-target relay banner.
- `assets/card-temp.png` — temporary-hold promo card.
- `assets/card-verified.png` — live-verification promo card.
- `assets/relay-loop.gif` — original looping GIF promo animation.

## Hosting

Upload the folder contents to a GitHub Pages branch or Cloudflare Pages project. Set the output/build directory to the package root and leave the build command empty. `index.html` is the entry point.

## Customize

Change the palette in `styles.css`, edit page text directly in the HTML files, and replace SVG/GIF assets in `assets/`. The homepage canvas animation is in `script.js`. The site also respects `prefers-reduced-motion` and includes a visible pause control.

The package is a visual/static front end only. It does not connect to social platforms, store posts, read credentials, or perform reposting.
