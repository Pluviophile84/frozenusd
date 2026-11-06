# Asset provenance

## Official logo (unchanged)

The current logo is **B-Rim**: the ink dollar symbol on a cyan hexagon face with a slightly darker hexagon rim. `brand-source/FrozenUSD-B-Rim/` is the package exactly as supplied (vector SVG/PDF/EPS, PNG sizes, solid-background versions, platform images and favicons). It was supplied without checksums, so `SHA256SUMS.txt` there was recorded on receipt. It is not served by the website. It replaces the earlier circular logo package, which has been removed from the repository.

Colours from the vector: rim `#6EC7E9`, face `#79DAFF`, ink `#071827`.

| Shipped file | Source in the package | Treatment |
|---|---|---|
| `public/brand/frozenusd-b-rim.svg` | `vector/FrozenUSD-B-Rim.svg` | byte-identical; header, footer, How it works seal |
| `public/brand/frozenusd-b-rim-tile-512.png` | `platform/favicon/maskable-512x512.png` | byte-identical; the closing-section mark on the cyan background (shown with rounded corners) |
| `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `maskable-512x512.png` | `platform/favicon/` | byte-identical |
| `public/site.webmanifest` | `platform/favicon/site.webmanifest` | one change: `short_name` from the obsolete `FRZUSD` to `USDFU` |
| `src/lib/emblem.ts` | the two hexagon polygons and the symbol path of `vector/FrozenUSD-B-Rim.svg` | verbatim strings, used in the generated posters and social image |

On the cyan poster, the logo sits on a navy square at 80% size, matching the supplied maskable icon, because the hexagon face is the same colour as that background. `tests/brand.test.mjs` verifies the package checksums, the byte-identical copies, the manifest and the inline geometry, and fails if the previous logo's geometry reappears.

No wordmark was supplied, so the site sets "Frozen USD" in Manrope beside the unchanged logo.

## Ice-cube artwork (approved, unchanged)

The approved ice cube is the owner's refined artwork: an opaque cyan hexagon plate carrying the B-Rim logo inside translucent ice (about 67% of pixels partially transparent), with a transparent exterior. It is the only cube depiction on the site and in generated assets.

| File | Notes |
|---|---|
| `brand-source/ice-cube/frozen-usd-ice-cube-as-received.webp` | the image exactly as attached (1254×1254 RGBA) |
| `brand-source/ice-cube/frozen-usd-ice-cube-master.png` | lossless PNG decode of those pixels and alpha; the master for all exports |
| `public/media/cube/frozen-usd-ice-cube-{128,256,512,1024}.webp` | downscaled from the master by `npm run assets` (Lanczos, alpha kept, never upscaled) |
| `brand-source/ice-cube/SHA256SUMS.txt` | checksums of all of the above, verified by `tests/brand.test.mjs` |

Only a single full-size image was supplied with this revision, so the web sizes are generated rather than supplied. If an original PNG or official web sizes exist, replace the files above and run `npm run assets`.

Every placement uses `src/components/Cube.astro`, the hero's `HeroArt.astro`, or (inside SVG line drawings and generated assets) the same files: the hero orbit (1 + 3 + 8), Reserves, the idea section, the three How it works stages, two small benefit drawings, the 404 page, poster 1 and the Open Graph image. The image is used at normal opacity and is never cropped, stretched, recoloured, blurred, faded or overlaid with a second logo. Contact shadows beneath it are separate SVG shapes (`src/lib/shadow.ts`).

## Decorative marks

`src/components/Decor.astro` draws the faint orbit-ring motif behind a few sections (Idea, Benefits, Satire, Memes, closing). Logo watermarks were removed at the owner's request; the logo appears only as a real brand mark (header, footer, closing mark, How it works proof seal), always loaded from the official files.

## Generated files

`scripts/build-assets.mjs` (run with `npm run assets`) writes:

| File | Size | Notes |
|---|---|---|
| `public/media/posters/frozen-still-moving.svg` / `.png` | 1080×1350 | light poster with the approved cube (embedded as a 440 px PNG in the SVG) |
| `public/media/posters/your-keys-our-freezer.svg` / `.png` | 1080×1350 | ink poster |
| `public/media/posters/no-thawing-required.svg` / `.png` | 1080×1350 | cyan poster with the Fictional Proof of Cold |
| `public/media/posters/*-preview.webp` | 720×900 | lightweight thumbnails shown on the page |
| `public/media/og-frozen-usd.png` | 1200×630 | Open Graph / X card with the approved cube |

Poster text (including the Frozen USD name and $USDFU ticker) is converted to outlines from Manrope (`@fontsource/manrope` WOFF files, OFL 1.1) with opentype.js, so the SVGs render the same without any installed font. PNGs are rasterised with Playwright's Chromium. All outputs are committed; Vercel never runs this script.

## Fonts

Manrope variable, Latin subset only (`@fontsource-variable/manrope`, one 24.8 KB WOFF2), self-hosted through the Astro build. Licence: `licenses/Manrope-OFL-1.1.txt`.
