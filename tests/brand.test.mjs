// The official logo must ship unchanged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { EMBLEM_PATH, BRAND_COLORS } from '../src/lib/emblem.ts';
import { CUBE_MASTER, CUBE_NATIVE_SIZE, CUBE_WIDTHS, cubeSrc } from '../src/lib/cube.ts';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root));
const source = 'brand-source/Frozen-USD-Logo-Master-v1.1/';

test('the official logo package matches its own SHA256SUMS', async () => {
  const sums = (await read(`${source}SHA256SUMS.txt`)).toString().trim().split('\n');
  assert.ok(sums.length > 10);
  for (const line of sums) {
    const [hash, file] = line.trim().split(/\s+/);
    const actual = createHash('sha256').update(await read(source + file)).digest('hex');
    assert.equal(actual, hash, file);
  }
});

test('shipped logo exports are byte-identical to the official SVGs', async () => {
  const pairs = {
    'public/brand/frozen-usd-master.svg': 'SVG/Frozen-USD-Master.svg',
    'public/brand/frozen-usd-reversed.svg': 'SVG/Frozen-USD-Reversed.svg',
    'public/brand/frozen-usd-symbol-ink.svg': 'SVG/Frozen-USD-Symbol-Ink.svg',
    'public/brand/frozen-usd-symbol-white.svg': 'SVG/Frozen-USD-Symbol-White.svg',
    'public/favicon.svg': 'SVG/Frozen-USD-Master.svg',
  };
  for (const [shipped, official] of Object.entries(pairs)) {
    assert.deepEqual(await read(shipped), await read(source + official), shipped);
  }
});

test('the inline emblem path is the official geometry', async () => {
  const master = (await read(`${source}SVG/Frozen-USD-Master.svg`)).toString();
  const d = master.match(/ d="([^"]+)"/)?.[1];
  assert.equal(EMBLEM_PATH, d);
  assert.match(master, new RegExp(`fill="${BRAND_COLORS.cyan}"`));
  assert.match(master, new RegExp(`fill="${BRAND_COLORS.ink}"`));
});

test('posters embed the official emblem path and need no external font or file', async () => {
  for (const slug of ['frozen-still-moving', 'your-keys-our-freezer', 'no-thawing-required']) {
    const svg = (await read(`public/media/posters/${slug}.svg`)).toString();
    assert.ok(svg.includes(EMBLEM_PATH), slug);
    assert.doesNotMatch(svg, /<text|font-family|@font-face|href="(?!data:image\/png;base64,)/, slug);
    assert.doesNotMatch(svg, /FRZUSD|FROZEN USD/, slug);
  }
});

test('the approved cube ships exactly as supplied, with genuinely translucent ice', async () => {
  // Master and web sizes match the checksums recorded from the supplied package.
  const sums = (await read('brand-source/ice-cube/SHA256SUMS.txt')).toString().trim().split('\n');
  assert.equal(sums.length, 1 + CUBE_WIDTHS.length);
  for (const line of sums) {
    const [hash, file] = line.trim().split(/\s+/);
    const actual = createHash('sha256').update(await read(new URL(file, new URL('brand-source/ice-cube/', root)))).digest('hex');
    assert.equal(actual, hash, file);
  }
  const masterPath = new URL(CUBE_MASTER, root).pathname;
  const meta = await sharp(masterPath).metadata();
  assert.equal(meta.width, CUBE_NATIVE_SIZE);
  assert.equal(meta.height, CUBE_NATIVE_SIZE);
  assert.equal(meta.hasAlpha, true);
  // A large share of the ice is partially transparent, so the page shows through.
  const { data, info } = await sharp(masterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let partial = 0;
  for (let i = 3; i < data.length; i += info.channels) if (data[i] > 0 && data[i] < 250) partial++;
  assert.ok(partial / (info.width * info.height) > 0.3, 'cube ice is not translucent');
  assert.equal(data[3], 0, 'exterior must be transparent');
  for (const width of CUBE_WIDTHS) {
    const exp = await sharp(new URL(`public${cubeSrc(width)}`, root).pathname).metadata();
    assert.equal(exp.width, width);
    assert.equal(exp.hasAlpha, true, `${width}px file lost its alpha channel`);
  }
});

test('the old procedural cube renderer and old ticker are gone from source and public assets', async () => {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'src', 'public', 'scripts'], {
    cwd: new URL('.', root).pathname,
    encoding: 'utf8',
  })
    .split('\n')
    .filter((f) => f && /\.(astro|ts|mjs|svg|css|json|txt)$/.test(f));
  for (const file of files) {
    const text = (await read(file)).toString();
    assert.doesNotMatch(text, /FRZUSD|iceBlockSvg|ice-block\.ts/, file);
  }
});
