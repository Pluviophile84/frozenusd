# Frozen USD — website

**Frozen. Still moving.**

The production website for Frozen USD ($USDFU), a memecoin parody presented as a financial product: the dollar that trades frozen. It is a single editorial homepage plus a 404 page, built as a static Astro site and deployed by Vercel from GitHub.

Frozen USD is not a dollar-backed product, a redemption service or a way to unlock frozen USDT or USDC. The site says so in the token facts, FAQ and footer. The "pegged 1:1 to an ice cube" reserve story is part of the parody, kept out of the factual token table.

## Commands

Requires Node.js 24.x (see `.nvmrc`) and npm.

```bash
npm ci
```

```bash
npm run dev       # local dev server at http://localhost:4321
```

```bash
npm run check     # Astro + TypeScript diagnostics (astro check, tsc --noEmit)
```

```bash
npm run build     # static production build into dist/
```

```bash
npm run preview   # serve the production build locally
```

```bash
npm test          # config, brand and browser tests (builds the site itself)
```

```bash
npm run assets    # regenerate posters + Open Graph image (only after changing them)
```

`npm test` drives Playwright's Chromium. If it is not installed on your machine, run `npx playwright install chromium` once.

## Vercel settings

Import this repository in Vercel (**Add New → Project → Import Git Repository**) with:

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Root directory | `./` (repository root) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | 24.x (also declared in `package.json` `engines`) |
| Environment variables | None required |

There is no `vercel.json`: Astro's static output needs no extra configuration, and Vercel serves `dist/404.html` for unknown routes. There are no SPA rewrites. Every push to a branch gets a preview deployment; merges to the production branch deploy production. Vercel's own Git integration is the only deployment path (the GitHub Actions workflow in `.github/workflows/ci.yml` only runs checks and tests).

Previews are always `noindex`. `canonicalOrigin` is set to the purchased domain, `https://frozenusd.com`, but a production deployment becomes indexable only after launch (`status: 'live'`). Attaching the domain to the Vercel project is done in Vercel (Project → Settings → Domains); this repository does not change DNS.

## Launch: pre-launch → live

All launch values live in **`src/config/site.ts`**. The committed state is pre-launch: no contract address, no trading link, no social links, `noindex`.

At launch, edit these fields with real, verified values:

```ts
canonicalOrigin: 'https://frozenusd.com',              // already set; keep unless the domain changes
token: {
  status: 'live',
  network: 'solana',                 // pump.fun tokens are on Solana
  contractAddress: '<real mint address>',
  tradeUrl: 'https://<real trading page>',
  explorerUrl: 'https://<explorer page for that exact address>',
  freezeAuthorityVerified: true,     // only after checking on the explorer that the mint has no freeze authority
},
social: {
  xUrl: 'https://x.com/<official handle>',          // or keep null
  communityUrl: 'https://<official community>',      // or keep null
},
```

Then commit and push. **The site is static, so the change only appears after Vercel rebuilds and redeploys.** Step-by-step instructions are in [`docs/launch-checklist.md`](docs/launch-checklist.md).

The build refuses an incomplete or malformed live configuration (missing network, a placeholder or wrongly formatted address, a non-HTTPS or example URL, an explorer link for a different address) with an error naming each problem. Address checks are syntax only. They do not prove the token exists or what permissions it has; verify those separately.

## Where to edit things

| What | Where |
|---|---|
| Launch values, social links, feature flags | `src/config/site.ts` (validated by `src/config/schema.ts`) |
| All public copy | `src/content/home.ts` |
| Page sections | `src/components/*.astro`, composed in `src/pages/index.astro` |
| 404 page | `src/pages/404.astro` |
| Document shell, SEO, fonts | `src/layouts/BaseLayout.astro` |
| Design tokens and shared styles | `src/styles/global.css` |
| Browser scripts (menu, copy, motion) | `src/scripts/` |
| The approved ice-cube artwork | received file, master and checksums `brand-source/ice-cube/`, generated web sizes `public/media/cube/`, rendered by `src/components/Cube.astro` (`src/lib/cube.ts`) |
| Hero orbit | `src/components/HeroArt.astro`, `src/scripts/hero-motion.ts` (ported from `Pluviophile84/frzusd`) |
| Reserves section | `src/components/Reserves.astro` (copy in `reserves` in `src/content/home.ts`) |
| Section ring motif | `src/components/Decor.astro` (no logo watermarks); light-section gradients at the end of `src/styles/global.css` |
| Official logo files | `public/brand/` and the favicons in `public/` (B-Rim, byte-identical), `brand-source/FrozenUSD-B-Rim/` (untouched official package) |
| Posters and social image | `public/media/` (generated by `scripts/build-assets.mjs`) |

More detail: [`docs/content-map.md`](docs/content-map.md), [`docs/asset-provenance.md`](docs/asset-provenance.md), [`docs/design-references.md`](docs/design-references.md).

## What was tested

`npm test` runs 53 tests:

- **Configuration rules:** the committed config is pre-launch with the `frozenusd.com` origin and stays noindex; a valid live fixture resolves; 15 kinds of invalid live configuration are rejected; the freeze authority can only be marked verified for a live Solana mint; placeholder/example/non-HTTPS URLs are never accepted; address syntax per network.
- **Brand integrity:** the official B-Rim logo package matches its recorded checksums; shipped logo files and favicons are byte-identical to the package; the inline logo geometry is the official geometry; posters embed the official path and need no font or external file; the cube master is a lossless decode of the received artwork, all cube files match their checksums, and the ice is genuinely translucent; no `$FRZUSD` or old procedural cube code remains in source or public assets.
- **Browser, pre-launch build:** no copy button, trading link or social link; every internal anchor resolves and the only external links are the dated Binance and Circle sources; no broken images, failed requests or console errors; `noindex`, no canonical, no sitemap; browser title *USDFU - Frozen USD* with the share title unchanged; the single memecoin notice, hero bridge, revised idea/how-it-works/benefits/satire/FAQ copy, linked evidence note and *Freeze authority: Planned: none; not yet verifiable* row; the header action *The cold facts* before launch; all six downloads return real files (PNG checked at 1080×1350); keyboard mobile menu; identity, promise, CTA and contract status within the first 390×844 screen; keyboard FAQ; Frozen USD / $USDFU branding; only the `$USDFU` ticker above the headline; the closing section on the logo cyan; decorative marks hidden from assistive technology; no backing line in the hero (Reserves carries it); Reserves follows the hero on the ink background with the exact copy; Reserves in header and footer navigation; the new FAQ order and answers; every cube is the approved image (17 on the page) with no old renderer; the hero has exactly 1 + 3 + 8 cubes, opposite 100-second revolutions, constant upright orientation and no clipping across a full revolution; the Pause/Replay button stops all 22 animations at the same frame, off-screen and hidden-tab pauses, and a user pause survives scrolling away and back; reduced-motion and no-JavaScript compositions are complete and static; no logo watermarks in section backgrounds; no overflow at 320 and 390 px; content, navigation and FAQ without JavaScript; real 404.
- **Browser, live fixture build:** Buy, address, Copy and Explorer controls appear with the configured values; copying puts the exact address on the clipboard and announces success; a refused clipboard announces failure; live production build emits canonical, `index`, OG image and a sitemap on the configured origin; a verified freeze authority shows *None* linked to the explorer.
- **Invalid live fixture:** the build fails with a clear configuration error.

Test fixtures exist only in `tests/helpers/fixtures.mjs`; they are never written to `src/config/site.ts`.

Measured with Lighthouse 13.6 against the local production build (simulated throttling, so not field data): mobile performance 100, accessibility 100, best practices 100, LCP 1.4 s, CLS 0, TBT 0 ms, 257 KiB transferred. The hero loads one 512/1024 px cube for the centre and one shared 128/256 px file for all eleven orbiting copies. SEO scores 66 only because pre-launch pages are deliberately `noindex`.

## Not yet connected

- **Token launch values:** the contract, network, trading and explorer links do not exist yet. They stay `null` until launch.
- **Official social accounts:** `xUrl` and `communityUrl` are `null`; the related actions stay hidden until they are set.
- **Production domain:** `https://frozenusd.com` is configured as `canonicalOrigin`. Pointing the domain at the Vercel project (DNS and Vercel's Domains settings) is outside this repository. Canonical URL and sitemap appear only in a live production build; previews use their own deployment URL for Open Graph tags.
- **Hero orbit source:** the orbit is a port of `HeroArt.astro` and its motion script from `Pluviophile84/frzusd` (commit `f741598`), with this site's approved ice cube as the only image. One styling change: the scene's background gradient ends transparent instead of white so it blends into this site's pale hero.
- **Vercel project:** this repository was prepared for Vercel's Git integration; connect it in the Vercel dashboard with the settings above.

## Licences

Manrope is used under the SIL Open Font License 1.1 (`licenses/Manrope-OFL-1.1.txt`), self-hosted from the `@fontsource-variable/manrope` package (Latin subset only). The Frozen USD logo and ice-cube artwork are the project's own.
