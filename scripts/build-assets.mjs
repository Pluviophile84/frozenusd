// Generates the committed image assets:
//   public/media/cube/frozen-usd-ice-cube-<w>.webp  (sized exports of the approved cube master)
//   public/media/posters/*.svg  (text converted to outlines: no font needed)
//   public/media/posters/*.png  (1080×1350, for sharing on X and elsewhere)
//   public/media/posters/*-preview.webp  (lightweight thumbnails shown on the page)
//   public/media/og-frozen-usd.png (1200×630 Open Graph image)
//
// Run with `npm run assets` after changing poster copy or the cube master.
// Resizing uses sharp (cube web sizes are downscaled from the master); rasterising uses Playwright's Chromium. Vercel never
// runs this script: the finished files are committed.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { contactShadowSvg } from '../src/lib/shadow.ts';
import { logoMark, logoOnNavyTile } from '../src/lib/emblem.ts';
import { CUBE_MASTER, CUBE_WIDTHS, CUBE_CONTENT } from '../src/lib/cube.ts';
import { memes, product } from '../src/content/home.ts';
import { siteConfig } from '../src/config/site.ts';

const root = new URL('../', import.meta.url);
const out = (path) => fileURLToPath(new URL(path, root));

const C = { cyan: '#79DAFF', ink: '#071827', white: '#FFFFFF', frost: '#F2F8FC', blue: '#005570', muted: '#526777' };

async function loadFont(weight) {
  const file = await readFile(out(`node_modules/@fontsource/manrope/files/manrope-latin-${weight}-normal.woff`));
  return opentype.parse(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
}

const fonts = { 800: await loadFont(800), 700: await loadFont(700), 600: await loadFont(600) };

const { name: BRAND_NAME, ticker: TICKER } = siteConfig.brand;

// The approved cube: sized WebP exports for the site (alpha preserved, never
// upscaled), and a PNG copy embedded in posters and the social image.
const { width: masterWidth, hasAlpha: masterAlpha } = await sharp(out(CUBE_MASTER)).metadata();
if (!masterAlpha) throw new Error('The cube master must keep its transparency');
await mkdir(out('public/media/cube'), { recursive: true });
for (const width of CUBE_WIDTHS) {
  if (width > masterWidth) throw new Error(`Refusing to upscale the cube master to ${width}px`);
  await sharp(out(CUBE_MASTER))
    .resize(width, width, { kernel: 'lanczos3' })
    .webp({ quality: 90, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(out(`public/media/cube/frozen-usd-ice-cube-${width}.webp`));
}
const cubePng = await sharp(out(CUBE_MASTER)).resize(440, 440, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
const cubeHref = `data:image/png;base64,${cubePng.toString('base64')}`;

/** The cube image, centred on cx with its visible base resting at baseY. */
function cubeImage(cx, baseY, size) {
  const x = cx - size / 2;
  const y = baseY - CUBE_CONTENT.bottom * size;
  return `<image x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" href="${cubeHref}"/>`;
}

/**
 * Lays out text glyph by glyph (kerning + tracking in em) and returns it as
 * outlined SVG path data, so posters need no installed font.
 */
function layout(str, size, weight, tracking) {
  const font = fonts[weight];
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(str);
  const positions = [];
  let x = 0;
  glyphs.forEach((glyph, i) => {
    positions.push(x);
    x += (glyph.advanceWidth ?? 0) * scale;
    const next = glyphs[i + 1];
    if (next) x += font.getKerningValue(glyph, next) * scale + tracking * size;
  });
  return { glyphs, positions, width: x };
}

function text(str, { size, weight = 800, x = 0, y = 0, tracking = 0, anchor = 'start' }) {
  const { glyphs, positions, width } = layout(str, size, weight, tracking);
  const startX = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x;
  const d = glyphs
    .map((glyph, i) => glyph.getPath(startX + positions[i], y, size).toPathData(2))
    .join('');
  if (d.includes('NaN')) throw new Error(`Bad outline for "${str}"`);
  return { d, width };
}

const path = (t, fill) => `<path fill="${fill}" d="${t.d}"/>`;

/** Largest size (≤ max) at which every line fits `maxWidth`. */
function fitSize(lines, maxWidth, max, weight = 800, tracking = -0.035) {
  const widest = Math.max(...lines.map((l) => layout(l, 100, weight, tracking).width));
  return Math.min(max, Math.floor((maxWidth / widest) * 100));
}

function brandRow({ W, fg, emblem }) {
  const name = text(BRAND_NAME, { size: 32, weight: 800, x: 84 + 64 + 20, y: 132, tracking: 0 });
  const ticker = text(TICKER, { size: 28, weight: 700, x: W - 84, y: 132, anchor: 'end', tracking: 0.02 });
  // The official logo; on the cyan poster it sits on its navy tile (as the
  // supplied maskable icon does) because the hexagon face matches the background.
  const disc = emblem === 'master' ? logoMark(84, 89, 64) : logoOnNavyTile(84, 89, 64, 12);
  return disc + path(name, fg) + path(ticker, fg);
}

function footerRow({ W, H, fg, rule }) {
  const left = text('MEMECOIN PARODY', { size: 20, weight: 700, x: 84, y: H - 84, tracking: 0.14 });
  const right = text('NO DOLLAR PEG OR REDEMPTION', { size: 20, weight: 700, x: W - 84, y: H - 84, anchor: 'end', tracking: 0.14 });
  return `<rect x="84" y="${H - 140}" width="${W - 168}" height="2" fill="${rule}"/>` + path(left, fg) + path(right, fg);
}

function headline(lines, { x, top, maxWidth, max, colors }) {
  const size = fitSize(lines, maxWidth, max);
  const leading = size * 0.94;
  return {
    size,
    bottom: top + leading * lines.length,
    svg: lines
      .map((line, i) => path(text(line, { size, weight: 800, x, y: top + leading * (i + 1) - size * 0.14, tracking: -0.035 }), colors[i] ?? colors[0]))
      .join(''),
  };
}

const W = 1080;
const H = 1350;
/** `bg` is either a colour or ready-made background markup. */
const svgOpen = (w, h, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  (bg.startsWith('<') ? bg : `<rect width="${w}" height="${h}" fill="${bg}"/>`);

function chip(label, x, y, { dot }) {
  const t = text(label, { size: 22, weight: 600, x: x + 44, y: y + 37, tracking: 0.01 });
  const w = t.width + 64;
  const marker =
    dot === 'temp'
      ? `<circle cx="${x + 24}" cy="${y + 29}" r="7" fill="${C.cyan}"/>`
      : `<circle cx="${x + 24}" cy="${y + 29}" r="6.5" fill="none" stroke="${C.blue}" stroke-width="2.5"/>`;
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="58" rx="8" fill="#FFFFFF" stroke="#DCE7EE" stroke-width="2"/>` +
    marker +
    path(t, C.ink)
  );
}

// Poster 1 — FROZEN. STILL MOVING. (light)
function posterStillMoving() {
  const bg =
    `<defs><linearGradient id="p1bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCEFF9"/></linearGradient>` +
    `<pattern id="p1grid" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="#FFFFFF" stroke-width="2"/></pattern></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#p1bg)"/><rect y="640" width="${W}" height="570" fill="url(#p1grid)" opacity="0.9"/>`;
  const head = headline(['FROZEN.', 'STILL', 'MOVING.'], { x: 80, top: 224, maxWidth: W - 168, max: 196, colors: [C.ink, C.blue, C.blue] });
  const padX = 760;
  const padY = 1128;
  return (
    svgOpen(W, H, bg) +
    brandRow({ W, fg: C.ink, emblem: 'master' }) +
    `<rect x="84" y="190" width="${W - 168}" height="2" fill="${C.ink}"/>` +
    head.svg +
    `<ellipse cx="${padX}" cy="${padY}" rx="170" ry="34" fill="#FFFFFF" stroke="#A3CDE0" stroke-width="2"/>` +
    `<ellipse cx="${padX}" cy="${padY}" rx="122" ry="23" fill="none" stroke="${C.blue}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="5 7"/>` +
    contactShadowSvg('p1s', padX, padY + 2, 320) +
    cubeImage(padX, padY - 18, 372) +
    chip('Location: updated', 84, 952, { dot: 'loc' }) +
    chip('Temperature: unchanged', 84, 1026, { dot: 'temp' }) +
    footerRow({ W, H, fg: C.ink, rule: C.ink }) +
    `</svg>`
  );
}

// Poster 2 — YOUR KEYS. OUR FREEZER. (ink)
function posterKeysFreezer() {
  const head = headline(['YOUR', 'KEYS.', 'OUR', 'FREEZER.'], {
    x: 80,
    top: 236,
    maxWidth: W - 168,
    max: 196,
    colors: [C.white, C.white, C.cyan, C.cyan],
  });
  // Line illustration from the website: a key inside a freezer.
  const art =
    `<g transform="translate(${W - 84 - 144 * 1.6} 1000) scale(1.6)" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<rect x="56" y="6" width="88" height="108" rx="6" fill="#0E2436" stroke="${C.white}" stroke-width="1.6"/>` +
    `<line x1="56" y1="40" x2="144" y2="40" stroke="${C.white}" stroke-width="1.6"/>` +
    `<line x1="132" y1="16" x2="132" y2="30" stroke="${C.white}" stroke-width="2"/>` +
    `<line x1="132" y1="52" x2="132" y2="74" stroke="${C.white}" stroke-width="2"/>` +
    `<rect x="64" y="48" width="58" height="58" rx="3" fill="${C.cyan}" fill-opacity="0.22" stroke="none"/>` +
    `<circle cx="80" cy="77" r="9" stroke="${C.cyan}" stroke-width="1.6" fill="${C.ink}"/>` +
    `<path d="M89 77 H114 M106 77 v7 M112 77 v5" stroke="${C.cyan}" stroke-width="1.6"/>` +
    `</g>`;
  return (
    svgOpen(W, H, C.ink) +
    `<defs><radialGradient id="p2glow" cx="1" cy="0" r="0.9"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#p2glow)"/>` +
    brandRow({ W, fg: C.white, emblem: 'master' }) +
    `<rect x="84" y="190" width="${W - 168}" height="2" fill="#1F3A50"/>` +
    head.svg +
    path(text('Decentralized until further notice.', { size: 30, weight: 700, x: 84, y: 1150 }), '#A9BCCB') +
    art +
    footerRow({ W, H, fg: '#A9BCCB', rule: '#1F3A50' }) +
    `</svg>`
  );
}

// Poster 3 — NO THAWING REQUIRED. (cyan)
function posterNoThawing() {
  const head = headline(['NO', 'THAWING', 'REQUIRED.'], { x: 80, top: 240, maxWidth: W - 168, max: 230, colors: [C.ink] });
  const boxY = 880;
  const rows = product.proof
    .map((row, i) => {
      const x = 124 + i * 280;
      return (
        path(text(row.term.toUpperCase(), { size: 20, weight: 700, x, y: boxY + 88, tracking: 0.12 }), C.blue) +
        path(text(row.value, { size: 44, weight: 800, x, y: boxY + 146, tracking: -0.02 }), C.ink)
      );
    })
    .join('');
  return (
    svgOpen(W, H, C.cyan) +
    brandRow({ W, fg: C.ink, emblem: 'reversed' }) +
    `<rect x="84" y="190" width="${W - 168}" height="2" fill="${C.ink}"/>` +
    head.svg +
    `<rect x="84" y="${boxY}" width="${W - 168}" height="240" rx="14" fill="#FFFFFF" fill-opacity="0.5" stroke="${C.ink}" stroke-width="3"/>` +
    rows +
    `<line x1="124" y1="${boxY + 182}" x2="${W - 124}" y2="${boxY + 182}" stroke="${C.ink}" stroke-width="2" stroke-dasharray="6 8"/>` +
    path(text(product.proofLabel.toUpperCase(), { size: 18, weight: 700, x: 124, y: boxY + 215, tracking: 0.14 }), C.ink) +
    footerRow({ W, H, fg: C.ink, rule: C.ink }) +
    `</svg>`
  );
}

// Open Graph — 1200×630
function ogImage() {
  const OW = 1200;
  const OH = 630;
  const bg =
    `<defs><linearGradient id="ogbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E3F3FB"/></linearGradient>` +
    `<pattern id="oggrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#FFFFFF" stroke-width="1.5"/></pattern>` +
    `<linearGradient id="ogpanel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF8FD"/><stop offset="1" stop-color="#D3EBF7"/></linearGradient></defs>` +
    `<rect width="${OW}" height="${OH}" fill="url(#ogbg)"/>` +
    `<rect x="700" y="40" width="460" height="550" rx="28" fill="url(#ogpanel)" stroke="#D3E6F0" stroke-width="2"/>` +
    `<rect x="700" y="40" width="460" height="550" rx="28" fill="url(#oggrid)" opacity="0.8"/>`;
  const name = text(BRAND_NAME, { size: 28, weight: 800, x: 72 + 48 + 16, y: 104 });
  const l1 = text('The dollar that', { size: 76, weight: 800, x: 68, y: 262, tracking: -0.038 });
  const l2 = text('trades frozen.', { size: 76, weight: 800, x: 68, y: 342, tracking: -0.038 });
  const sig = text('Frozen. Still moving.', { size: 32, weight: 800, x: 116, y: 428 });
  const meta = text(`${TICKER}  ·  MEMECOIN PARODY`, { size: 18, weight: 700, x: 68, y: 548, tracking: 0.12 });
  const padY = 486;
  return (
    svgOpen(OW, OH, bg) +
    logoMark(72, 71, 48) +
    path(name, C.ink) +
    path(l1, C.ink) +
    path(l2, C.ink) +
    `<rect x="68" y="408" width="34" height="4" rx="2" fill="${C.cyan}"/>` +
    path(sig, C.blue) +
    `<rect x="68" y="500" width="560" height="1.5" fill="#C3D5E0"/>` +
    path(meta, C.muted) +
    `<ellipse cx="930" cy="${padY}" rx="150" ry="32" fill="#FFFFFF" stroke="#A3CDE0" stroke-width="1.5"/>` +
    `<ellipse cx="930" cy="${padY}" rx="108" ry="21" fill="none" stroke="${C.blue}" stroke-opacity="0.35" stroke-dasharray="4 5" stroke-width="1.5"/>` +
    contactShadowSvg('ogs', 930, padY + 2, 290) +
    cubeImage(930, padY - 22, 372) +
    `</svg>`
  );
}

const posters = {
  'frozen-still-moving': posterStillMoving(),
  'your-keys-our-freezer': posterKeysFreezer(),
  'no-thawing-required': posterNoThawing(),
};

// Keep slugs in sync with the website copy.
for (const p of memes.posters) {
  if (!posters[p.slug]) throw new Error(`No poster design for ${p.slug}`);
}

await mkdir(out('public/media/posters'), { recursive: true });
for (const [slug, svg] of Object.entries(posters)) {
  await writeFile(out(`public/media/posters/${slug}.svg`), `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`);
}

const { chromium } = await import('playwright');
const browser = await chromium.launch();
async function rasterise(svg, width, height, file) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: out(file), clip: { x: 0, y: 0, width, height } });
  await page.close();
}
for (const [slug, svg] of Object.entries(posters)) {
  await rasterise(svg, W, H, `public/media/posters/${slug}.png`);
  await sharp(out(`public/media/posters/${slug}.png`))
    .resize(720)
    .webp({ quality: 86, effort: 6 })
    .toFile(out(`public/media/posters/${slug}-preview.webp`));
}
await rasterise(ogImage(), 1200, 630, 'public/media/og-frozen-usd.png');
await browser.close();
console.log('Assets written to public/media/.');
