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

The approved ice cube — the cyan Frozen USD coin embedded in clear ice, with a transparent exterior — is the only cube depiction on the site and in generated assets.

| File | Notes |
|---|---|
| `brand-source/ice-cube/frozen-usd-ice-cube-as-received.webp` | the artwork exactly as delivered to this build (1254×1254 WebP with alpha, from the chat upload) |
| `brand-source/ice-cube/frozen-usd-ice-cube-master.png` | lossless PNG decode of those pixels and alpha; the master for all exports |
| `public/media/cube/frozen-usd-ice-cube-{160,320,640,960}.webp` | downscaled exports (Lanczos, alpha preserved, never upscaled) written by `npm run assets` |

The original PNG file was not available to this build. If it differs from the received image, replace the master with it and run `npm run assets`; a test checks that the master still matches the received file, so update that check deliberately.

Every placement uses `src/components/Cube.astro` (or, inside SVG line drawings and generated assets, the same exports): the hero orbit (1 + 3 + 8), Reserves, the idea section, the three How it works stages, two small benefit drawings and the 404 page. The image is never cropped, stretched, recoloured, blurred, faded or overlaid with a second logo. Contact shadows beneath it are separate SVG shapes (`src/lib/shadow.ts`). The earlier procedural SVG cube (`src/lib/ice-block.ts`) has been removed.

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
