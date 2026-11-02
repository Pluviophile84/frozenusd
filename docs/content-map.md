# Content map

All public copy lives in `src/content/home.ts`. Launch-dependent labels are chosen by the components from `src/config/site.ts`.

Copy follows the website build prompt's selected copy (section 8), which overrides the content pack where they differ. The message hierarchy matches `creative-canon.json`.

| Order | Section (anchor) | Component | Copy export | Notes |
|---|---|---|---|---|
| A | Header | `Header.astro` | `nav`, `actions` | Action: *Token details* → `#token` pre-launch; *Buy $FRZUSD* when live |
| B | Hero (`#top`) | `Hero.astro`, `HeroArt.astro` | `hero` | One H1. Contract strip: unavailable text pre-launch; address + Copy + Explorer when live |
| C | The idea (`#idea`) | `Idea.astro` | `idea` | Closing line: *Hot wallet. Cold dollars.* |
| D | The product (`#how-it-works`) | `Product.astro` | `product` | Three stages, *No thawing required.*, Fictional Proof of Cold |
| E | Product benefits | `Benefits.astro` | `benefits` | Three parts with line illustrations |
| F | The satire | `Satire.astro` | `satire` | Dark-ink section. Dated note shown when `features.datedNews` is true |
| G | Token information (`#token`) | `TokenFacts.astro` | `token` | No price, chart, supply, holders, tax or audit claims |
| H | Community (`#memes`) | `Memes.astro` | `memes` | Three posters with Download (PNG) and SVG links; social actions only when configured |
| I | FAQ (`#faq`) | `Faq.astro` | `faq` | Native `<details>`/`<summary>`; heading *Frequently asked questions* |
| J | Final CTA and footer | `Closing.astro`, `Footer.astro` | `closing`, `footer` | Build year is set at build time |
| K | 404 | `src/pages/404.astro` | `notFound` | Always `noindex` |
| — | SEO | `BaseLayout.astro` | `seo` | Title and description from the build prompt |

## Fixed hierarchy

| Role | Line | Where it appears |
|---|---|---|
| Main slogan | Frozen. Still moving. | Hero signature, closing signature, footer, title, posters, OG image |
| Product headline | The dollar that trades frozen. | H1, OG image |
| Product explanation | Transfer it. Trade it. No thawing required. | Hero support, description |
| Institutional descriptor | A new standard in frozen finance. | Idea eyebrow |
| Satirical signature | Decentralized until further notice. | Satire H2, poster 2 |
| Control joke | Your keys. Our freezer. | Satire closing, poster 2 |
| Product campaign | Hot wallet. Cold dollars. | Idea closing |
| Sign-off | Keep it cold. | Closing sign-off, memes body |

## Small interface labels added by the build

These are functional labels, not new marketing claims: *Concept illustration*, *Location: updated*, *Temperature: unchanged* (both from the prompt), *Wallet A*, *Wallet B*, *In transit*, *Pause movement*, *Contract*, *Pre-launch* / *Live*, *Copy*, *Explorer*, *Download*, *SVG*, *Back to top*, *Skip to content*, *Frequently asked questions*, *Error 404*. Poster footers read *MEMECOIN PARODY* and *NO DOLLAR PEG OR REDEMPTION* so a shared image keeps its disclaimer.

## Not rendered

The content pack's research notes, post bank, social profiles, source lists and production instructions are not published. The pack itself is not committed.
