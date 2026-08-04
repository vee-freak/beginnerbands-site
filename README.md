# JA Beginner Bands — D2C landing page

A single-SKU, mobile-first landing page for the JA Beginner Bands set of 6, built to
send traffic straight to Amazon US or Amazon Canada.

Static HTML/CSS/JS — no build step, no dependencies. Drop the folder on any host
(Netlify, Vercel, Cloudflare Pages, S3).

```bash
python3 -m http.server 8899
```

---

## Files

```
index.html      the whole page
styles.css      design system + all layout
script.js       store switching, reveals, welcome video, FAQ, sticky bar
assets/img/     official brand photography, logo, flag SVGs
assets/video/   welcome.mp4 (the 98-second brand video)
```

All photography is the brand's own (Justin, the box shot, the workout stills),
optimized to ~1400–1700px JPEG. `flag-us.svg` / `flag-ca.svg` are hand-built;
the maple leaf uses the public-domain Wikimedia geometry.

---

## Things you'll want to edit

### 1. Store config — `script.js`, top of file

```js
var ASIN = 'B0DLPWCJYR';

var STORES = {
  us: { host: 'https://www.amazon.com', tag: '', price: 49.99, currency: 'USD', ... },
  ca: { host: 'https://www.amazon.ca',  tag: '', price: 62.99, currency: 'CAD', ... }
};
```

- **`tag`** — your Amazon Associates tracking id. Leave `''` if unused.
- **`price`** — display only, rendered as "$49.99 USD" / "$62.99 CAD". Amazon is
  the source of truth; refresh when pricing moves. Verified 4 Aug 2026: US $49.99, CA $62.99.

Every link with `class="js-buy" data-store="auto"` follows the visitor's selected
country; fixed `data-store="us"`/`"ca"` links (footer) always point at that store.

**Country detection order:** saved choice (localStorage) → `?store=ca` URL param →
IANA timezone → browser language → default US.

### 2. Reviews — `index.html`, `#reviews`

Three review cards are **placeholders** (dashed borders, grey text — they can't
ship unnoticed). Replace the `<p>`/`<cite>` in each, then delete
`data-placeholder="true"` from the wrapping `.grid3`.

The aggregate figures are real, pulled from Amazon.com on 28 Jul 2026: 4.6★,
193 global ratings, histogram 82/9/3/4/2. Refresh these and the JSON-LD
`aggregateRating` when they drift.

### 3. Copy

Section copy follows the wording on the original beginnerbands.com
("thoughtfully created for those taking their first steps into fitness",
"gentle, accessible, and effective", "Upgrade your door in minutes", the three
Low Impact / Durable Design / Compact & Travel-Friendly bullets). The headline is
the site's own tagline: **"Start your fitness journey with confidence."**

---

## Design notes

**Type.** Fraunces (warm editorial serif) for headlines, Source Sans 3 for
everything else. Body copy runs ~19px. FAQ questions and big numerals are serif;
labels, buttons and UI are sans.

**Colour.** `--blue: #34A4DD` is the brand blue, used unchanged for fills, the
logo and accents on dark. `--blue-cta: #17739F` (same hue, deeper) carries filled
buttons and blue text on cream so everything clears WCAG AA — the 50+ audience
reads this page comfortably. Band swatch colours in the "Six levels" ladder are
sampled from the official product photography.

**Motion.** Scroll reveals, the staggered resistance ladder, count-up review
numbers, FAQ accordion, sticky mobile buy bar, and a slow float on the hero
cutout. Everything respects `prefers-reduced-motion`.

**Hero.** Justin's white-background product photo is blended with
`mix-blend-mode: multiply`, so it sits directly on the cream/radial background
without needing an alpha-channel cutout.

---

## Accessibility (checked at 375px and 1440px, Chrome)

- 0 WCAG AA contrast failures across all text
- All interactive targets ≥ 44px
- No horizontal overflow
- Keyboard operable; country switch is a radio group with arrow-key support
- Skip link, landmarks, labelled star ratings, `scope` on table headers
- Full `prefers-reduced-motion` support

**Not verified:** screen-reader testing (VoiceOver/NVDA); Safari/Firefox rendering.

## Known follow-ups

- `assets/video/welcome.mp4` is the 98-second welcome video, compressed to
  ~11 MB (720p H.264, faststart). It is click-to-play with `preload="metadata"`
  so visitors only download it when they press play. The original 144 MB
  export is not in the repo; keep it archived separately.
- Images are JPEG; converting to WebP would trim ~40% off the image payload.
- Reviews and rating figures are hard-coded from Amazon (28 Jul 2026); refresh
  them periodically.
