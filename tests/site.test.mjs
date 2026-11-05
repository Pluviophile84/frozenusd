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
    // Before launch, "Buy $USDF" exists only as the header action pointing at the token facts.
    assert.equal(await page.getByText('Buy $USDF').count(), 1);
    assert.equal(await page.getByText('Follow on X').count(), 0);
    assert.equal(await page.locator('.site-header .header-cta').getAttribute('href'), '#token');
    assert.equal(await page.locator('.site-header .header-cta').innerText(), 'Buy $USDF');
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
    assert.equal(await page.title(), 'USDF - Frozen USD');
    // Icons and manifest come from the official B-Rim package and resolve.
    const icons = await page.$$eval('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]', (ls) => ls.map((l) => l.href));
    assert.equal(icons.length, 4);
    for (const href of icons) assert.equal((await page.request.get(href)).status(), 200, href);
    const manifest = await (await page.request.get(origin + '/site.webmanifest')).json();
    for (const icon of manifest.icons) assert.equal((await page.request.get(origin + icon.src)).status(), 200, icon.src);
    // Every logo on the page is the official B-Rim file.
    const logoSrcs = await page.$$eval('img[src^="/brand/"]', (imgs) => [...new Set(imgs.map((i) => i.getAttribute('src')))]);
    assert.deepEqual(logoSrcs.sort(), ['/brand/frozenusd-b-rim-tile-512.png', '/brand/frozenusd-b-rim.svg']);
    assert.equal((await page.locator('title').count()), 1);
    // Sharing metadata keeps the established title.
    assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'), 'Frozen USD — Frozen. Still moving.');
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

  test('the first mobile screen shows the ticker, promise, action and contract status', async () => {
    const { context, page } = await open(origin, { width: 390, height: 844 });
    for (const selector of ['.hero-ticker', 'h1', '.hero-actions .btn', '.contract-strip']) {
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

  test('brand, ticker and reserves section', async () => {
    const { context, page } = await open(origin);
    assert.equal(await page.locator('.site-header .logo-text').innerText(), 'Frozen USD');
    assert.equal(await page.locator('.site-header .logo-text').evaluate((el) => getComputedStyle(el).textTransform), 'none');
    const text = await page.locator('body').innerText();
    assert.doesNotMatch(text, /FRZUSD|\bFUSD\b/);
    assert.match(text, /\$USDF/);
    // The backing line was removed from the hero; Reserves carries it.
    assert.equal(await page.locator('.hero a[href="#reserves"], .hero-backing').count(), 0);
    assert.doesNotMatch(await page.locator('.hero-copy').innerText(), /Pegged 1:1/);
    // Reserves sits directly after the hero on the dark ink background.
    const order = await page.$$eval('main > section', (sections) => sections.map((s) => s.id || s.className.split(' ')[1]));
    assert.deepEqual(order.slice(0, 4), ['top', 'reserves', 'idea', 'how-it-works']);
    const bg = (sel) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);
    assert.equal(await bg('#reserves'), 'rgb(7, 24, 39)');
    assert.notEqual(await bg('#idea'), 'rgb(7, 24, 39)');
    const reserves = await page.locator('#reserves').innerText();
    for (const line of [
      'THE COLD STANDARD',
      '100% backed by cold, hard reserves.',
      'Every USDF is pegged 1:1 to an institutional-grade ice cube, held in our Strategic Ice Reserve in Antarctica. Our reserves are maintained in solid form. Unlike conventional financial institutions, we consider liquidity a temperature problem.',
      'One USDF. One ice cube.',
      'Fully reserved. Deeply refrigerated.',
      'Cold storage. Literally.',
      'Fully backed. Mostly transparent.',
      'Transparency is central to our operation. Unfortunately, so is frost.',
      'Reserve visibility may vary depending on frost conditions.',
    ]) {
      assert.ok(reserves.includes(line), line);
    }
    const facts = await page.$$eval('#reserves .reserve-fact', (els) =>
      els.map((el) => [el.querySelector('.reserve-value')?.textContent, el.querySelector('dt')?.textContent]),
    );
    assert.deepEqual(facts, [
      ['1:1', 'Ice-cube peg'],
      ['100%', 'Cold, hard backing'],
      ['Antarctica', 'Reserve location'],
    ]);
    assert.doesNotMatch(text, /Greenland|Alaska|Siberia/);
    // The verified token table stays factual.
    assert.doesNotMatch(await page.locator('#token .facts').innerText(), /ice|reserve|Antarctica|Siberia/i);
    // The cold facts separate the fiction from the real transfers.
    const coldFacts = await page.locator('#token .token-body').innerText();
    assert.match(coldFacts, /The dollar backing is fictional\. The refrigeration is fictional\. The transfers are real\./);
    assert.match(coldFacts, /\$USDF is a memecoin parody, not a dollar-backed stablecoin\. No dollar peg\. No redemption promise\./);
    assert.doesNotMatch(coldFacts, /technology is the joke/);
    const freeze = page.locator('#token .fact--freeze');
    assert.equal((await freeze.locator('dt').textContent())?.trim(), 'Freeze authority');
    assert.equal((await freeze.locator('dd').innerText()).trim(), 'None (planned)');
    assert.equal(await freeze.locator('a').count(), 0);
    // The satire ends on the freeze-authority punchline.
    const punch = await page.locator('.satire-punchline').innerText();
    assert.match(punch, /Some digital dollars have a freeze authority\.\s+We have a Strategic Ice Reserve\.\s+Only one of those can stop a transfer\./);
    // Navigation lists Reserves right after The idea, in the header and footer.
    for (const nav of ['#primary-menu', '.footer-nav']) {
      const labels = await page.$$eval(`${nav} a`, (as) => as.map((a) => a.textContent?.trim()));
      assert.deepEqual(labels.slice(0, 2), ['The idea', 'Reserves'], nav);
    }
    await context.close();
  });

  test('hero shows the $USDF ticker directly below the headline; closing sits on the logo cyan', async () => {
    const { context, page } = await open(origin);
    assert.equal((await page.locator('.hero-ticker').innerText()).trim(), '$USDF');
    assert.equal(await page.locator('h1 + .hero-ticker').count(), 1);
    const [h1Box, tickerBox] = [await page.locator('h1').boundingBox(), await page.locator('.hero-ticker').boundingBox()];
    assert.ok(h1Box && tickerBox && tickerBox.y >= h1Box.y + h1Box.height);
    const heroText = await page.locator('.hero-copy').innerText();
    assert.doesNotMatch(heroText, /MEMECOIN PARODY|Frozen USD ·/i);
    const closing = page.locator('section.closing');
    assert.equal(await closing.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(121, 218, 255)');
    // Decorative ring marks stay behind content and out of the accessibility tree.
    const decor = await page.$$eval('.decor', (els) => els.map((el) => [el.getAttribute('aria-hidden'), getComputedStyle(el).pointerEvents]));
    assert.ok(decor.length >= 5);
    assert.ok(decor.every(([hidden, pe]) => hidden === 'true' && pe === 'none'));
    await context.close();
  });

  test('FAQ carries the parody peg and reserve answers', async () => {
    const { context, page } = await open(origin);
    const questions = await page.$$eval('#faq summary .q', (els) => els.map((el) => el.textContent));
    const pegged = questions.indexOf('What is USDF pegged to?');
    assert.ok(pegged >= 0);
    assert.equal(questions[pegged + 1], 'What backs it?');
    const answer = (q) =>
      page
        .locator('#faq details', { hasText: q })
        .locator('.answer p')
        .evaluateAll((ps) => ps.map((p) => p.textContent?.trim()).join(' '));
    assert.equal(
      await answer('What is USDF pegged to?'),
      'One USDF. One ice cube. We standardized the cube because ‘some ice’ did not look institutional enough. This is our parody peg. USDF is a memecoin with no dollar peg or redemption promise.',
    );
    assert.equal(await answer('What backs it?'), 'Our Strategic Ice Reserve in Antarctica. One institutional-grade ice cube per USDF. Cold storage. Literally.');
    assert.equal(
      await answer('Is Frozen USD a stablecoin?'),
      'It has the brochure confidence of one. $USDF is a memecoin with no dollar peg or redemption promise.',
    );
    assert.equal(
      await answer('How can it be frozen and still move?'),
      "The freezing is conceptual. The movement is real. $USDF is designed to circulate without an issuer freeze authority. No thawing, no permission from the refrigeration department. The ice is a metaphor. The transfers aren't.",
    );
    await context.close();
  });

  test('every cube is the approved image and the old renderer is gone', async () => {
    const { context, page } = await open(origin);
    for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 700) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(30);
    }
    await page.waitForLoadState('networkidle');
    const cubes = await page.$$eval('img[src*="/media/cube/"]', (imgs) => imgs.map((i) => ({ src: i.currentSrc, w: i.naturalWidth, h: i.naturalHeight })));
    // 12 in the hero + reserves + idea + 3 stages.
    assert.equal(cubes.length, 17);
    for (const cube of cubes) {
      assert.match(cube.src, /\/media\/cube\/frozen-usd-ice-cube-\d+\.webp$/);
      assert.equal(cube.w, cube.h);
    }
    const svgCubes = await page.$$eval('svg image', (els) => els.map((el) => el.getAttribute('href')));
    assert.ok(svgCubes.length >= 2 && svgCubes.every((href) => /\/media\/cube\//.test(href ?? '')));
    assert.equal(await page.locator('.ice-block, [class*="wallet"]').count(), 0);
    await context.close();
  });

  test('section backgrounds carry no logo watermarks', async () => {
    const { context, page } = await open(origin);
    assert.equal(await page.locator('.decor--emblem').count(), 0);
    // Logo files appear only as real brand marks: header, footer, closing mark and proof seal.
    const logos = await page.$$eval('main section img[src^="/brand/"]', (imgs) => imgs.map((i) => i.closest('section')?.className ?? ''));
    assert.ok(logos.every((cls) => /closing|product/.test(cls)), JSON.stringify(logos));
    assert.equal(await page.locator('svg path[d^="M482.826343"], svg path[d^="M479.179636"]').count(), 0);
    await context.close();
  });

  const orbitAnimations = (page) =>
    page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.animationName === 'orbit-clockwise' || a.animationName === 'orbit-counterclockwise')
        .map((a) => ({ name: a.animationName, state: a.playState, duration: a.effect.getTiming().duration, time: Number(a.currentTime) })),
    );

  test('hero orbit (frzusd mechanism): one centre, three outer and eight inner cubes, all upright', async () => {
    const { context, page } = await open(origin);
    const scene = page.locator('.orbital-scene');
    assert.equal(await scene.getAttribute('aria-label'), 'Frozen USD tokens circulate while remaining frozen.');
    assert.equal(await page.locator('.orbital-system').getAttribute('aria-hidden'), 'true');
    assert.equal(await scene.locator('.central-cube img').count(), 1);
    assert.equal(await scene.locator('.orbital-ring-outer .orbit-carrier').count(), 3);
    assert.equal(await scene.locator('.orbital-ring-inner .orbit-carrier').count(), 8);
    assert.equal(await scene.locator('img[src*="/media/cube/"]').count(), 12);
    assert.equal(await scene.locator('.orbital-guides circle').count(), 5);
    assert.match(await scene.locator('figcaption').innerText(), /In circulation\s+Temperature: unchanged/);

    const running = await orbitAnimations(page);
    assert.equal(running.length, 22);
    assert.ok(running.every((a) => a.duration === 100000 && a.state === 'running'));

    const angles = (t) =>
      page.evaluate((time) => {
        for (const a of document.getAnimations()) {
          if (/^orbit-(counter)?clockwise$/.test(a.animationName)) a.currentTime = time;
        }
        const angle = (el) => {
          const m = new DOMMatrix(getComputedStyle(el).transform);
          return (Math.atan2(m.b, m.a) * 180) / Math.PI;
        };
        return [...document.querySelectorAll('.orbit-carrier')].map((carrier) => ({
          ring: carrier.closest('.orbital-ring-outer') ? 'outer' : 'inner',
          carrier: angle(carrier),
          net: angle(carrier) + angle(carrier.querySelector('.orbit-counter')),
          rect: carrier.querySelector('img').getBoundingClientRect().toJSON(),
        }));
      }, t);
    const systemBox = await page.locator('.orbital-system').boundingBox();
    const norm = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;
    const t0 = await angles(10000);
    const t1 = await angles(20000);
    for (const [i, item] of t0.entries()) {
      assert.ok(Math.abs(norm(item.net)) < 0.01, `cube ${i} not upright`);
      const delta = norm(t1[i].carrier - item.carrier);
      assert.ok(Math.abs(Math.abs(delta) - 36) < 0.1, `cube ${i} moved ${delta}° in 10 s`);
      assert.equal(Math.sign(delta), item.ring === 'outer' ? 1 : -1);
    }
    for (let t = 0; t < 100000; t += 5000) {
      for (const item of await angles(t)) {
        assert.ok(item.rect.left >= systemBox.x - 1 && item.rect.right <= systemBox.x + systemBox.width + 1);
        assert.ok(item.rect.top >= systemBox.y - 1 && item.rect.bottom <= systemBox.y + systemBox.height + 1);
      }
    }
    await context.close();
  });

  test('hero orbit pauses together, respects visibility and keeps a user pause', async () => {
    const { context, page } = await open(origin);
    const states = async () => [...new Set((await orbitAnimations(page)).map((a) => a.state))];
    const toggle = page.locator('.motion-toggle');
    assert.ok(await toggle.isVisible());
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    assert.deepEqual(await states(), ['running']);

    // Off-screen pauses; returning resumes.
    await page.evaluate(() => document.querySelector('#token')?.scrollIntoView());
    await page.waitForFunction(() => !document.querySelector('.hero-art')?.classList.contains('is-moving'));
    assert.deepEqual(await states(), ['paused']);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => document.querySelector('.hero-art')?.classList.contains('is-moving'));
    assert.deepEqual(await states(), ['running']);

    // A hidden tab pauses.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.deepEqual(await states(), ['paused']);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.deepEqual(await states(), ['running']);

    // The toggle holds every carrier and counter at the same frame, and the
    // user's pause survives scrolling away and back.
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
    assert.equal((await toggle.innerText()).trim(), 'Replay movement');
    assert.deepEqual(await states(), ['paused']);
    const times = [...new Set((await orbitAnimations(page)).map((a) => Math.round(a.time)))];
    assert.equal(times.length, 1);
    await page.evaluate(() => document.querySelector('#token')?.scrollIntoView());
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    assert.deepEqual(await states(), ['paused']);
    await toggle.click();
    assert.equal((await toggle.innerText()).trim(), 'Pause movement');
    assert.deepEqual(await states(), ['running']);
    const resumed = Math.min(...(await orbitAnimations(page)).map((a) => a.time));
    assert.ok(resumed >= times[0] - 1 && resumed < times[0] + 1000, `resumed at ${resumed}, paused at ${times[0]}`);
    await context.close();
  });

  test('reduced motion and no-JavaScript keep the full static composition', async () => {
    const upright = (page) =>
      page.$$eval('.orbit-carrier', (carriers) =>
        carriers.map((c) => {
          const a = (el) => {
            const m = new DOMMatrix(getComputedStyle(el).transform);
            return (Math.atan2(m.b, m.a) * 180) / Math.PI;
          };
          const sum = Math.abs(a(c) + a(c.querySelector('.orbit-counter')));
          return sum < 0.01 || Math.abs(sum - 360) < 0.01;
        }),
      );

    const still = await open(origin, { reducedMotion: 'reduce' });
    const names = await still.page.$$eval('.orbital-scene *', (els) => [...new Set(els.map((el) => getComputedStyle(el).animationName))]);
    assert.deepEqual(names, ['none']);
    const ups = await upright(still.page);
    assert.equal(ups.length, 11);
    assert.ok(ups.every(Boolean));
    const visible = await still.page.$$eval('.orbital-scene img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth > 0).length);
    assert.equal(visible, 12);
    await still.context.close();

    const noJs = await open(origin, { javaScriptEnabled: false });
    assert.equal(await noJs.page.locator('.orbital-scene img').count(), 12);
    assert.equal(await noJs.page.locator('.motion-toggle').isVisible(), false);
    const noJsNames = await noJs.page.$$eval('.orbit-carrier, .orbit-counter', (els) => [...new Set(els.map((el) => getComputedStyle(el).animationName))]);
    assert.deepEqual(noJsNames, ['none']);
    assert.ok((await upright(noJs.page)).every(Boolean));
    await noJs.context.close();
  });

  test('the orbit fits without overflow on narrow phones', async () => {
    for (const width of [320, 390]) {
      const { context, page } = await open(origin, { width, height: 760 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      const box = await page.locator('.orbital-scene').boundingBox();
      assert.ok(box && box.x >= -4 && box.x + box.width <= width + 4);
      await context.close();
    }
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
    assert.match(await cta.innerText(), /Buy \$USDF/);
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
    const freeze = page.locator('#token .fact--freeze dd a');
    assert.equal((await freeze.innerText()).replace(/\s*\(verify.*$/, '').trim(), 'None');
    assert.equal(await freeze.getAttribute('href'), fixture.token.explorerUrl);
    await context.close();
  });

  test('copy reports success and puts the real address on the clipboard', async () => {
    const { context, page } = await open(origin, { permissions: ['clipboard-read', 'clipboard-write'] });
    const button = page.locator('#token .fact--contract [data-copy-button]');
    assert.ok(await button.isVisible());
    await button.click();
    await page.waitForFunction(() => document.querySelector('#token-address-status')?.textContent !== '');
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
    await page.waitForFunction(() => document.querySelector('#hero-address-status')?.textContent !== '');
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
      assert.match(String(error.stderr), /Invalid Frozen USD launch configuration/);
      assert.match(String(error.stderr), /contractAddress/);
      return true;
    });
  });
});
