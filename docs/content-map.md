# Content map

All public copy lives in `src/content/home.ts`. Launch-dependent labels are chosen by the components from `src/config/site.ts`.

Copy follows the website build prompt's selected copy (section 8) plus the later update brief (name Frozen USD, ticker $USDFU, ice-cube peg and reserves; reserve location Antarctica), which override the content pack where they differ. Public name: *Frozen USD* (mixed case in the navbar and labels; uppercase only in eyebrows and poster headlines). Ticker: *$USDFU*, or *USDFU* inside sentences. The message hierarchy matches `creative-canon.json`.

| Order | Section (anchor) | Component | Copy export | Notes |
|---|---|---|---|---|
| A | Header | `Header.astro` | `nav`, `actions` | Nav: The idea, Reserves, How it works, The cold facts, Memes. Action: *The cold facts* → `#token` pre-launch (never a purchase label without a trading link); *Buy $USDFU* → verified trading URL when live |
| B | Hero (`#top`) | `Hero.astro`, `HeroArt.astro` | `hero` | H1, `$USDFU` ticker, *Transfer it. Trade it. No thawing required.*, bridge *Some digital dollars have an issuer freeze switch. Our freezer is reserved for ice.* (smaller, muted), *Frozen. Still moving.*, actions, contract strip. Orbit of 12 cubes ported from frzusd |
| B2 | Reserves (`#reserves`) | `Reserves.astro` | `reserves` | Dark ink section directly after the hero. Corporate satire, no explanatory labels; never in the token table |
| C | The idea (`#idea`) | `Idea.astro` | `idea` | *We froze the reserves. Not the transfers.* Leads: issuer power to stop some digital dollars; *Our freezer has a narrower mandate: keep the reserves cold.* Steps: *The dollar went on-chain. / The issuer kept a switch. / We kept the ice.* Closing *Hot wallet. Cold dollars.* |
| D | The product (`#how-it-works`) | `Product.astro` | `product` | Stages: *The reserve has already committed to the temperature.* / *A new address. Same winter.* / *The reserve stays cold. Ownership changes.* *No thawing required.*, *Proof of Cold.* |
| E | Product benefits | `Benefits.astro` | `benefits` | *The reserve entered service below zero.* / unchanged / *In your wallet, you manage the keys. We manage the temperature.* |
| F | The satire | `Satire.astro` | `satire` | Dark-ink section. *Your keys. Our freezer.* then the freeze-authority / Strategic Ice Reserve contrast. Dated note *The switch in plain sight.* (when `features.datedNews`): Binance and Circle statements, each linked to its source, and the theft-response context |
| G | Token information (`#token`) | `TokenFacts.astro` | `token` | The site's single memecoin notice beside the facts table. Freeze authority row: *Planned: none; not yet verifiable* before launch, *Planned: none; verification pending* when live but unchecked, *None* linked to the explorer once verified. No price, chart, supply, holders, tax or audit claims |
| H | Community (`#memes`) | `Memes.astro` | `memes` | Three posters with Download (PNG) and SVG links; social actions only when configured |
| I | FAQ (`#faq`) | `Faq.astro` | `faq` | Native `<details>`/`<summary>`. *Can the issuer freeze my $USDFU?* uses the *designed* answer until the live token is verified. *The cold facts* in answers links to `#token`. No memecoin disclaimer repeated |
| J | Final CTA and footer | `Closing.astro`, `Footer.astro` | `closing`, `footer` | Closing section on the logo cyan (#79DAFF). Footer: branding, navigation, copyright, live links; no disclaimer (the notice lives in The cold facts) |
| K | 404 | `src/pages/404.astro` | `notFound` | Always `noindex` |
| — | SEO | `BaseLayout.astro` | `seo` | Browser tab title *USDFU - Frozen USD*; share title *Frozen USD — Frozen. Still moving.*; description (page, Open Graph, X): *designed to move without an issuer freeze authority* until verified, then *moves without* |

## Fixed hierarchy

| Role | Line | Where it appears |
|---|---|---|
| Main slogan | Frozen. Still moving. | Hero signature, closing signature, footer, title, posters, OG image |
| Product headline | The dollar that trades frozen. | H1, OG image |
| Backing proposition | 100% backed by cold, hard reserves. One USDFU. One ice cube. | Reserves section; FAQ |
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
