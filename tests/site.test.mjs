// Browser tests against real production builds:
//   1. the committed pre-launch configuration,
//   2. a valid live fixture (test-only values),
//   3. an invalid live fixture, which must fail to build.
// Uses Playwright's Chromium (set PLAYWRIGHT_BROWSERS_PATH if it is installed elsewhere).
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, readFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startStaticServer } from './helpers/static-server.mjs';
import { liveFixture, FIXTURE_SOLANA_ADDRESS } from './helpers/fixtures.mjs';

const run = promisify(execFile);
const buildScript = fileURLToPath(new URL('./helpers/build-site.mjs', import.meta.url));
const work = await mkdtemp(join(tmpdir(), 'frzusd-test-'));

async function buildSite(name, fixture, env = {}) {
  const outDir = join(work, name);
  const args = [buildScript, outDir];
  if (fixture) {
    const file = join(work, `${name}.json`);
    await writeFile(file, JSON.stringify(fixture));
    args.push(file);
  }
  await run(process.execPath, args, { env: { ...process.env, ...env }, maxBuffer: 1 << 24 });
  return outDir;
}

const exists = (path) => access(path).then(() => true, () => false);

let browser;
const servers = [];

before(async () => {
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await Promise.all(servers.map((s) => s.close()));
  await rm(work, { recursive: true, force: true });
});

async function open(origin, { width = 1440, height = 1000, ...options } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, ...options });
  const page = await context.newPage();
  const errors = [];
  const failed = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('requestfailed', (req) => failed.push(req.url()));
  page.on('response', (res) => res.status() >= 400 && failed.push(`${res.status()} ${res.url()}`));
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  return { context, page, errors, failed };
}

describe('pre-launch build (committed configuration)', () => {
  let dist;
  let origin;

  before(async () => {
    dist = await buildSite('prelaunch', null, { VERCEL_ENV: 'production' });
    const server = await startStaticServer(dist);
    servers.push(server);
    origin = server.origin;
  });

  test('renders the truthful pre-launch state with no live controls', async () => {
    const { context, page, errors, failed } = await open(origin);
    const html = await page.content();
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal((await page.locator('h1').innerText()).trim(), 'The dollar that trades frozen.');
    assert.ok(html.includes('Contract address not available yet.'));
    assert.equal(await page.locator('[data-copy-button]').count(), 0);
    assert.equal(await page.getByText('Buy $FRZUSD').count(), 0);
    assert.equal(await page.getByText('Follow on X').count(), 0);
    assert.equal(await page.locator('.site-header .header-cta').getAttribute('href'), '#token');
    assert.equal(await page.locator('.site-header .header-cta').innerText(), 'Token details');
    // Lazy images: scroll through the page, then confirm every image decoded.
    for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 700) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(40);
    }
    await page.waitForLoadState('networkidle');
    const broken = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
    assert.deepEqual(broken, []);
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    await context.close();
  });

  test('every link resolves: internal anchors exist, external links are real HTTPS', async () => {
    const { context, page } = await open(origin);
    const hrefs = await page.$$eval('a[href]', (links) => links.map((a) => a.getAttribute('href')));
    for (const href of hrefs) {
      assert.ok(href && href !== '#' && !/null|undefined|example\.|\{|\[/.test(href), `bad href ${href}`);
      if (href.startsWith('#')) {
        assert.equal(await page.locator(href).count(), 1, `missing anchor target ${href}`);
      } else if (!href.startsWith('/')) {
        assert.match(href, /^https:\/\//, href);
      }
    }
    const external = hrefs.filter((h) => h.startsWith('https://'));
    assert.deepEqual(external, ['https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751']);
    await context.close();
  });

  test('pre-launch metadata is noindex with no canonical URL or sitemap', async () => {
    const { context, page } = await open(origin);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
    assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
    assert.equal(await page.title(), 'FROZEN USD — Frozen. Still moving.');
    assert.equal(await exists(join(dist, 'sitemap.xml')), false);
    assert.ok(await exists(join(dist, 'robots.txt')));
    assert.doesNotMatch(await readFile(join(dist, 'robots.txt'), 'utf8'), /Sitemap/);
    await context.close();
  });

  test('download controls return the actual poster files', async () => {
    const { context, page } = await open(origin);
    const links = await page.$$eval('#memes a[download]', (as) => as.map((a) => a.href));
    assert.equal(links.length, 6);
    for (const url of links) {
      const res = await page.request.get(url);
      assert.equal(res.status(), 200, url);
      const body = await res.body();
      if (url.endsWith('.png')) {
        assert.equal(body.subarray(1, 4).toString(), 'PNG');
        assert.equal(body.readUInt32BE(16), 1080);
        assert.equal(body.readUInt32BE(20), 1350);
      } else {
        assert.match(body.toString(), /^<\?xml[\s\S]*<svg[\s\S]*<\/svg>\s*$/);
      }
    }
    await context.close();
  });

  test('mobile menu works from the keyboard', async () => {
    const { context, page } = await open(origin, { width: 390, height: 844 });
    const toggle = page.locator('[data-menu-toggle]');
    assert.ok(await toggle.isVisible());
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#primary-menu a').first().isVisible(), false);
    await toggle.focus();
    await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    assert.ok(await page.locator('#primary-menu a').first().isVisible());
    assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'The idea');
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle')), true);
    // A menu link closes the menu and moves to its section.
    await page.keyboard.press('Enter');
    await page.locator('#primary-menu a[href="#token"]').click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await page.waitForFunction(() => location.hash === '#token');
    await context.close();
  });

  test('the first mobile screen shows identity, promise, action and contract status', async () => {
    const { context, page } = await open(origin, { width: 390, height: 844 });
    for (const selector of ['.hero .eyebrow', '.hero .identity', 'h1', '.hero-actions .btn', '.contract-strip']) {
      const box = await page.locator(selector).first().boundingBox();
      assert.ok(box && box.y + box.height <= 844, `${selector} below the fold`);
    }
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.equal(width, 390);
    await context.close();
  });

  test('FAQ opens and closes from the keyboard', async () => {
    const { context, page } = await open(origin);
    const first = page.locator('#faq details').first();
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await first.evaluate((d) => d.open), true);
    await page.keyboard.press('Space');
    assert.equal(await first.evaluate((d) => d.open), false);
    await context.close();
  });

  test('hero motion loops, can be paused, and is removed for reduced motion', async () => {
    const moving = await open(origin);
    const state = (p) => p.locator('.hero-art .mover').evaluate((el) => getComputedStyle(el).animationPlayState);
    assert.notEqual(await moving.page.locator('.hero-art .mover').evaluate((el) => getComputedStyle(el).animationName), 'none');
    assert.equal(await state(moving.page), 'running');
    await moving.page.locator('label[for="hero-motion"]').click();
    assert.equal(await moving.page.locator('#hero-motion').isChecked(), true);
    assert.equal(await state(moving.page), 'paused');
    await moving.context.close();

    const still = await open(origin, { reducedMotion: 'reduce' });
    assert.equal(await still.page.locator('.hero-art .mover').evaluate((el) => getComputedStyle(el).animationName), 'none');
    assert.equal(await still.page.locator('label[for="hero-motion"]').isVisible(), false);
    await still.context.close();
  });

  test('content, navigation and FAQ work without JavaScript', async () => {
    const { context, page } = await open(origin, { width: 390, height: 844, javaScriptEnabled: false });
    assert.equal(await page.locator('[data-menu-toggle]').isVisible(), false);
    assert.ok(await page.locator('#primary-menu a[href="#idea"]').isVisible());
    assert.ok(await page.getByText('Decentralized until further notice.').isVisible());
    const details = page.locator('#faq details').nth(3);
    await details.locator('summary').click();
    assert.ok(await details.getByText("We do not have access to another issuer's controls").isVisible());
    await context.close();
  });

  test('unknown routes return the 404 page', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const res = await page.goto(origin + '/no-such-page');
    assert.equal(res?.status(), 404);
    assert.equal(await page.locator('h1').innerText(), "This dollar moved. The page didn't.");
    assert.equal(await page.getByRole('link', { name: 'Back to Frozen USD' }).getAttribute('href'), '/');
    await context.close();
  });
});

describe('live build (test fixture)', () => {
  let dist;
  let origin;
  const fixture = liveFixture();

  before(async () => {
    dist = await buildSite('live', fixture, { VERCEL_ENV: 'production' });
    const server = await startStaticServer(dist);
    servers.push(server);
    origin = server.origin;
  });

  test('enables trading, explorer and social controls', async () => {
    const { context, page, errors } = await open(origin);
    const cta = page.locator('.site-header .header-cta');
    assert.match(await cta.innerText(), /Buy \$FRZUSD/);
    assert.equal(await cta.getAttribute('href'), fixture.token.tradeUrl);
    assert.equal(await page.locator('.hero-actions a').first().getAttribute('href'), fixture.token.tradeUrl);
    assert.equal(await page.locator('#token-address-value').innerText(), FIXTURE_SOLANA_ADDRESS);
    assert.equal(await page.locator('#hero-address-value').innerText(), FIXTURE_SOLANA_ADDRESS);
    const explorers = await page.$$eval('a', (as) => as.filter((a) => a.textContent?.includes('Explorer')).map((a) => a.getAttribute('href')));
    assert.ok(explorers.length >= 2 && explorers.every((h) => h === fixture.token.explorerUrl));
    assert.ok(await page.getByText('Follow on X').first().isVisible());
    assert.equal(await page.locator('.contract-head .status').innerText(), 'Live');
    assert.ok((await page.locator('.fact dd').nth(2).innerText()).includes('Solana'));
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('copy reports success and puts the real address on the clipboard', async () => {
    const { context, page } = await open(origin, { permissions: ['clipboard-read', 'clipboard-write'] });
    const button = page.locator('#token .fact--contract [data-copy-button]');
    assert.ok(await button.isVisible());
    await button.click();
    assert.equal(await page.locator('#token-address-status').innerText(), 'Address copied.');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), FIXTURE_SOLANA_ADDRESS);
    await context.close();
  });

  test('copy reports failure clearly when the clipboard refuses', async () => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    const page = await context.newPage();
    await page.goto(origin + '/');
    await page.locator('#hero-address-status').waitFor({ state: 'attached' });
    await page.locator('.contract-strip [data-copy-button]').click();
    assert.equal(
      await page.locator('#hero-address-status').innerText(),
      'Copy failed. Select the address and copy it manually.',
    );
    await context.close();
  });

  test('a live production build with a verified origin is indexable', async () => {
    const { context, page } = await open(origin);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'index, follow');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `${fixture.canonicalOrigin}/`);
    assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), `${fixture.canonicalOrigin}/media/og-frozen-usd.png`);
    const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
    assert.ok(sitemap.includes(`<loc>${fixture.canonicalOrigin}/</loc>`));
    assert.doesNotMatch(sitemap, /localhost|127\.0\.0\.1|example/);
    await context.close();
  });
});

describe('invalid live configuration', () => {
  test('fails the build with a clear configuration error', async () => {
    const fixture = liveFixture();
    fixture.token.contractAddress = 'PASTE_CONTRACT_ADDRESS_HERE';
    await assert.rejects(buildSite('invalid', fixture), (error) => {
      assert.match(String(error.stderr), /Invalid FROZEN USD launch configuration/);
      assert.match(String(error.stderr), /contractAddress/);
      return true;
    });
  });
});
