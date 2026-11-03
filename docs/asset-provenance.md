# Asset provenance

## Official logo (unchanged)

`brand-source/Frozen-USD-Logo-Master-v1.1/` is the official logo package (three-prong forked-S, v1.1) exactly as supplied, including `README.md`, `MASTER-SPEC.json` and `SHA256SUMS.txt`. It is not served by the website.

Colours confirmed from the SVGs: glacial cyan `#79DAFF`, ink `#071827`.

| Shipped file | Source | Treatment |
|---|---|---|
| `public/brand/frozen-usd-master.svg` | `SVG/Frozen-USD-Master.svg` | byte-identical copy |
| `public/brand/frozen-usd-reversed.svg` | `SVG/Frozen-USD-Reversed.svg` | byte-identical copy |
| `public/brand/frozen-usd-symbol-ink.svg` | `SVG/Frozen-USD-Symbol-Ink.svg` | byte-identical copy |
| `public/brand/frozen-usd-symbol-white.svg` | `SVG/Frozen-USD-Symbol-White.svg` | byte-identical copy |
| `public/favicon.svg` | `SVG/Frozen-USD-Master.svg` | byte-identical copy |
| `public/favicon.ico` | `PNG/Frozen-USD-Master-16/32/48.png` | packed into one ICO, pixels unchanged |
| `public/apple-touch-icon.png` | `PNG/Frozen-USD-Token-Fullbleed-512.png` | resized to 180×180 |
| `src/lib/emblem.ts` | path `d` of `SVG/Frozen-USD-Master.svg` | verbatim string, used for inline artwork |

`tests/brand.test.mjs` verifies the package checksums, the byte-identical copies and the inline path.

No wordmark was supplied, so the site sets "Frozen USD" in Manrope beside the unchanged emblem. The earlier snowflake direction is not used.

## Ice-cube artwork (approved, unchanged)

The approved ice cube is the opaque cyan Frozen USD coin inside genuinely translucent ice (about half the pixels are partially transparent), with a transparent exterior. It replaced an earlier version whose ice interior was opaque. It is the only cube depiction on the site and in generated assets.

| File | Notes |
|---|---|
| `brand-source/ice-cube/frozen-usd-ice-cube-master.png` | 1254×1254 RGBA master, byte-identical to the supplied file |
| `brand-source/ice-cube/README.txt` | the supplier's usage notes |
| `public/media/cube/frozen-usd-ice-cube-{128,256,512,1024}.webp` | the supplied WebP sizes, byte-identical |
| `brand-source/ice-cube/SHA256SUMS.txt` | checksums of all five files, verified by `tests/brand.test.mjs` |

The supplied layered SVG and separate layer PNGs (about 9 MB) are not committed; they are editing sources, not needed by the site.

Every placement uses `src/components/Cube.astro` (or, inside SVG line drawings and generated assets, the same files): the hero orbit (1 + 3 + 8), Reserves, the idea section, the three How it works stages, two small benefit drawings and the 404 page. The image is used at normal opacity, never cropped, stretched, recoloured, blurred, faded or overlaid with a second logo. Contact shadows beneath it are separate SVG shapes (`src/lib/shadow.ts`).

## Decorative marks

`src/components/Decor.astro` draws faded section watermarks: the official emblem path (unchanged geometry, single colour at 2–5% opacity) and the hero's orbit-ring motif. They are `aria-hidden`, ignore pointer input and sit behind content.

## Generated files

`scripts/build-assets.mjs` (run with `npm run assets`) writes:

| File | Size | Notes |
|---|---|---|
| `public/media/posters/frozen-still-moving.svg` / `.png` | 1080×1350 | light poster with the approved cube (embedded as a 440 px PNG in the SVG) |
| `public/media/posters/your-keys-our-freezer.svg` / `.png` | 1080×1350 | ink poster |
| `public/media/posters/no-thawing-required.svg` / `.png` | 1080×1350 | cyan poster with the Fictional Proof of Cold |
| `public/media/posters/*-preview.webp` | 720×900 | lightweight thumbnails shown on the page |
| `public/media/og-frozen-usd.png` | 1200×630 | Open Graph / X card with the approved cube |

Poster text (including the Frozen USD name and $FUSD ticker) is converted to outlines from Manrope (`@fontsource/manrope` WOFF files, OFL 1.1) with opentype.js, so the SVGs render the same without any installed font. PNGs are rasterised with Playwright's Chromium. All outputs are committed; Vercel never runs this script.

## Fonts

Manrope variable, Latin subset only (`@fontsource-variable/manrope`, one 24.8 KB WOFF2), self-hosted through the Astro build. Licence: `licenses/Manrope-OFL-1.1.txt`.
