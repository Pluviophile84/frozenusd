# Content map

All public copy lives in `src/content/home.ts`. Launch-dependent labels are chosen by the components from `src/config/site.ts`.

Copy follows the website build prompt's selected copy (section 8) plus the later update brief (name Frozen USD, ticker $USDF, ice-cube peg and reserves; reserve location Antarctica), which override the content pack where they differ. Public name: *Frozen USD* (mixed case in the navbar and labels; uppercase only in eyebrows and poster headlines). Ticker: *$USDF*, or *USDF* inside sentences. The message hierarchy matches `creative-canon.json`.

| Order | Section (anchor) | Component | Copy export | Notes |
|---|---|---|---|---|
| A | Header | `Header.astro` | `nav`, `actions` | Nav: The idea, Reserves, How it works, The cold facts, Memes. Action: *Buy $USDF* → `#token` pre-launch (no trading link exists yet; the token facts say so); *Buy $USDF* → trading URL when live |
| B | Hero (`#top`) | `Hero.astro`, `HeroArt.astro` | `hero` | `$USDF` ticker directly below the H1 (the eyebrow and MEMECOIN PARODY tag were removed at the owner's request; the parody status remains in token facts, FAQ and footer). No backing line (removed at the owner's request; Reserves carries it). Orbit of 12 cubes ported from frzusd, caption *In circulation / Temperature: unchanged*. Contract strip: unavailable text pre-launch; address + Copy + Explorer when live |
| B2 | Reserves (`#reserves`) | `Reserves.astro` | `reserves` | Dark ink section directly after the hero. Parody backing only; never in the token table |
| C | The idea (`#idea`) | `Idea.astro` | `idea` | Closing line: *Hot wallet. Cold dollars.* |
| D | The product (`#how-it-works`) | `Product.astro` | `product` | Three stages, *No thawing required.*, Fictional Proof of Cold |
| E | Product benefits | `Benefits.astro` | `benefits` | Three parts with line illustrations |
| F | The satire | `Satire.astro` | `satire` | Dark-ink section. Dated note shown when `features.datedNews` is true |
| G | Token information (`#token`) | `TokenFacts.astro` | `token` | No price, chart, supply, holders, tax or audit claims |
| H | Community (`#memes`) | `Memes.astro` | `memes` | Three posters with Download (PNG) and SVG links; social actions only when configured |
| I | FAQ (`#faq`) | `Faq.astro` | `faq` | Native `<details>`/`<summary>`; heading *Frequently asked questions*; *What is USDF pegged to?* precedes *What backs it?* |
| J | Final CTA and footer | `Closing.astro`, `Footer.astro` | `closing`, `footer` | Closing section on the logo cyan (#79DAFF). Build year is set at build time |
| K | 404 | `src/pages/404.astro` | `notFound` | Always `noindex` |
| — | SEO | `BaseLayout.astro` | `seo` | Title and description from the build prompt |

## Fixed hierarchy

| Role | Line | Where it appears |
|---|---|---|
| Main slogan | Frozen. Still moving. | Hero signature, closing signature, footer, title, posters, OG image |
| Product headline | The dollar that trades frozen. | H1, OG image |
| Backing proposition | Pegged 1:1 to an ice cube. 100% backed by cold, hard reserves. | Reserves section; FAQ |
| Product explanation | Transfer it. Trade it. No thawing required. | Hero support, description |
| Institutional descriptor | A new standard in frozen finance. | Idea eyebrow |
| Satirical signature | Decentralized until further notice. | Satire H2, poster 2 |
| Control joke | Your keys. Our freezer. | Satire closing, poster 2 |
| Product campaign | Hot wallet. Cold dollars. | Idea closing |
| Sign-off | Keep it cold. | Closing sign-off, memes body |

## Small interface labels added by the build

These are functional labels, not new marketing claims: *Wallet A*, *Wallet B* (How it works only), *In transit*, *In circulation*, *Temperature: unchanged*, *Pause movement* / *Replay movement*, *Contract*, *Pre-launch* / *Live*, *Copy*, *Explorer*, *Download*, *SVG*, *Back to top*, *Skip to content*, *Frequently asked questions*, *Error 404*. Poster footers read *MEMECOIN PARODY* and *NO DOLLAR PEG OR REDEMPTION* so a shared image keeps its disclaimer.

## Not rendered

The content pack's research notes, post bank, social profiles, source lists and production instructions are not published. The pack itself is not committed.
