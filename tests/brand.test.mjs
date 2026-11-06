// The official logo must ship unchanged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { EMBLEM_PATH, BRAND_COLORS, LOGO_RIM_POINTS, LOGO_FACE_POINTS } from '../src/lib/emblem.ts';
import { CUBE_MASTER, CUBE_NATIVE_SIZE, CUBE_WIDTHS, cubeSrc } from '../src/lib/cube.ts';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root));
const source = 'brand-source/FrozenUSD-B-Rim/';

test('the official logo package matches the checksums recorded on receipt', async () => {
  const sums = (await read(`${source}SHA256SUMS.txt`)).toString().trim().split('\n');
  assert.equal(sums.length, 32);
  for (const line of sums) {
    const [hash, file] = line.trim().split(/\s+/);
    const actual = createHash('sha256').update(await read(source + file)).digest('hex');
    assert.equal(actual, hash, file);
  }
});

test('shipped logo files and favicons are byte-identical to the official package', async () => {
  const pairs = {
    'public/brand/frozenusd-b-rim.svg': 'vector/FrozenUSD-B-Rim.svg',
    'public/brand/frozenusd-b-rim-tile-512.png': 'platform/favicon/maskable-512x512.png',
    'public/favicon.svg': 'platform/favicon/favicon.svg',
    'public/favicon.ico': 'platform/favicon/favicon.ico',
    'public/apple-touch-icon.png': 'platform/favicon/apple-touch-icon.png',
    'public/android-chrome-192x192.png': 'platform/favicon/android-chrome-192x192.png',
    'public/android-chrome-512x512.png': 'platform/favicon/android-chrome-512x512.png',
    'public/maskable-512x512.png': 'platform/favicon/maskable-512x512.png',
  };
  for (const [shipped, official] of Object.entries(pairs)) {
    assert.deepEqual(await read(shipped), await read(source + official), shipped);
  }
  // The supplied manifest is shipped with one correction: the old ticker in short_name.
  const manifest = JSON.parse((await read('public/site.webmanifest')).toString());
  const supplied = JSON.parse((await read(`${source}platform/favicon/site.webmanifest`)).toString());
  assert.deepEqual({ ...manifest, short_name: supplied.short_name }, supplied);
  assert.equal(manifest.short_name, 'USDFU');
});

test('the inline logo geometry is the official B-Rim vector', async () => {
  const svg = (await read(`${source}vector/FrozenUSD-B-Rim.svg`)).toString();
  const polygons = [...svg.matchAll(/<polygon points="([^"]+)" fill="([^"]+)"/g)];
  assert.equal(polygons[0]?.[1], LOGO_RIM_POINTS);
  assert.equal(polygons[0]?.[2], BRAND_COLORS.rim);
  assert.equal(polygons[1]?.[1], LOGO_FACE_POINTS);
  assert.equal(polygons[1]?.[2], BRAND_COLORS.cyan);
  assert.equal(svg.match(/ d="([^"]+)"/)?.[1], EMBLEM_PATH);
  assert.match(svg, new RegExp(`fill="${BRAND_COLORS.ink}"`));
});

test('posters embed the official emblem path and need no external font or file', async () => {
  for (const slug of ['frozen-still-moving', 'your-keys-our-freezer', 'no-thawing-required']) {
    const svg = (await read(`public/media/posters/${slug}.svg`)).toString();
    assert.ok(svg.includes(EMBLEM_PATH) && svg.includes(LOGO_FACE_POINTS), slug);
    assert.doesNotMatch(svg, /M479\.179636/, slug); // the previous logo's geometry
    assert.doesNotMatch(svg, /<text|font-family|@font-face|href="(?!data:image\/png;base64,)/, slug);
    assert.doesNotMatch(svg, /FRZUSD|FROZEN USD/, slug);
    assert.ok(svg.includes('<path'), slug);
  }
});

test('the approved cube matches the received artwork, with genuinely translucent ice', async () => {
  // The received file, its master decode and the web sizes match the recorded checksums.
  const sums = (await read('brand-source/ice-cube/SHA256SUMS.txt')).toString().trim().split('\n');
  assert.equal(sums.length, 2 + CUBE_WIDTHS.length);
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
  assert.ok(data[3] <= 8, 'exterior must be transparent');
  // The master is a lossless decode of the image exactly as received.
  const received = await sharp(new URL('brand-source/ice-cube/frozen-usd-ice-cube-as-received.webp', root).pathname).ensureAlpha().raw().toBuffer();
  assert.ok(received.equals(data), 'master differs from the received artwork');
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
    .filter((f) => f && /\.(astro|ts|mjs|svg|css|json|txt|webmanifest)$/.test(f));
  for (const file of files) {
    const text = (await read(file)).toString();
    assert.doesNotMatch(text, /FRZUSD|\bFUSD\b|\bUSDF\b|iceBlockSvg|ice-block\.ts|frozen-usd-(master|reversed|symbol)|M479\.179636/, file);
  }
});
