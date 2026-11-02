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

## Product art (original)

`src/lib/ice-block.ts` draws the hero object as native SVG: the official emblem on a coin with a rim, embedded in an ice block with irregular rounded edges, layered cloudy inclusions, branching stress fractures, trapped air bubbles, a static turbulence-based frost texture, lit depth faces, and a contact shadow with a cyan caustic. The polished rectangular bevels were replaced in the $FUSD refinement to make the material read as ice. It is an illustration, not a photographic render. No image generation, stock imagery or WebGL is used.

The same function renders the hero, the idea section, the three product stages (simplified detail), the 404 page, poster 1 and the Open Graph image.

## Generated files

`scripts/build-assets.mjs` (run with `npm run assets`) writes:

| File | Size | Notes |
|---|---|---|
| `public/media/posters/frozen-still-moving.svg` / `.png` | 1080×1350 | light poster with the product object |
| `public/media/posters/your-keys-our-freezer.svg` / `.png` | 1080×1350 | ink poster |
| `public/media/posters/no-thawing-required.svg` / `.png` | 1080×1350 | cyan poster with the Fictional Proof of Cold |
| `public/media/og-frozen-usd.png` | 1200×630 | Open Graph / X card |

Poster text is converted to outlines from Manrope (`@fontsource/manrope` WOFF files, OFL 1.1) with opentype.js, so the SVGs render the same without any installed font. PNGs are rasterised with Playwright's Chromium. All outputs are committed; Vercel never runs this script.

## Fonts

Manrope variable, Latin subset only (`@fontsource-variable/manrope`, one 24.8 KB WOFF2), self-hosted through the Astro build. Licence: `licenses/Manrope-OFL-1.1.txt`.
