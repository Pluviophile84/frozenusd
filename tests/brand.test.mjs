// The official logo must ship unchanged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { EMBLEM_PATH, BRAND_COLORS } from '../src/lib/emblem.ts';

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

test('posters embed the official emblem path and need no external font', async () => {
  for (const slug of ['frozen-still-moving', 'your-keys-our-freezer', 'no-thawing-required']) {
    const svg = (await read(`public/media/posters/${slug}.svg`)).toString();
    assert.ok(svg.includes(EMBLEM_PATH), slug);
    assert.doesNotMatch(svg, /<text|font-family|@font-face|<image|href="http/, slug);
  }
});
