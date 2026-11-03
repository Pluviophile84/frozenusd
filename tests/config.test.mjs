// Unit tests for the launch configuration rules (src/config/schema.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveSiteConfig,
  validateHttpsUrl,
  validateOrigin,
  isValidAddress,
  SiteConfigError,
} from '../src/config/schema.ts';
import { siteConfig } from '../src/config/site.ts';
import { liveFixture, FIXTURE_SOLANA_ADDRESS, FIXTURE_EVM_ADDRESS } from './helpers/fixtures.mjs';

const clone = (value) => structuredClone(value);

test('the committed configuration is a truthful pre-launch configuration', () => {
  assert.equal(siteConfig.token.status, 'prelaunch');
  assert.equal(siteConfig.token.contractAddress, null);
  assert.equal(siteConfig.token.tradeUrl, null);
  assert.equal(siteConfig.token.explorerUrl, null);
  assert.equal(siteConfig.canonicalOrigin, 'https://frozenusd.com');
  assert.deepEqual(siteConfig.brand, { name: 'Frozen USD', ticker: '$USDF', slogan: 'Frozen. Still moving.' });
  const site = resolveSiteConfig(siteConfig, { vercelEnv: 'production' });
  assert.deepEqual(site.token, { status: 'prelaunch', networkLabel: null });
  // The domain is configured, but nothing is indexable until launch.
  assert.equal(site.canonicalOrigin, 'https://frozenusd.com');
  assert.equal(site.indexable, false);
  assert.deepEqual(site.social, { xUrl: null, communityUrl: null });
});

test('a complete live configuration resolves to live values', () => {
  const site = resolveSiteConfig(liveFixture(), { vercelEnv: 'production' });
  assert.equal(site.token.status, 'live');
  assert.equal(site.token.networkLabel, 'Solana');
  assert.equal(site.token.contractAddress, FIXTURE_SOLANA_ADDRESS);
  assert.match(site.token.tradeUrl, /^https:\/\//);
  assert.equal(site.indexable, true);
  assert.equal(site.canonicalOrigin, 'https://frozen-usd-fixture.vercel.app');
});

test('live builds stay noindex on previews or without a canonical origin', () => {
  assert.equal(resolveSiteConfig(liveFixture(), { vercelEnv: 'preview' }).indexable, false);
  const noOrigin = liveFixture();
  noOrigin.canonicalOrigin = null;
  assert.equal(resolveSiteConfig(noOrigin, { vercelEnv: 'production' }).indexable, false);
});

const invalidLive = {
  'missing network': (c) => (c.token.network = null),
  'placeholder address': (c) => (c.token.contractAddress = 'YOUR_CONTRACT_ADDRESS'),
  'empty address': (c) => (c.token.contractAddress = ''),
  'all-zero address': (c) => (c.token.contractAddress = '11111111111111111111111111111111'),
  'EVM address on Solana': (c) => (c.token.contractAddress = FIXTURE_EVM_ADDRESS),
  'http trade URL': (c) => (c.token.tradeUrl = 'http://pump.fun/coin/x'),
  'example trade URL': (c) => (c.token.tradeUrl = 'https://example.com/trade'),
  'template trade URL': (c) => (c.token.tradeUrl = 'https://pump.fun/coin/{{CONTRACT_ADDRESS}}'),
  'missing explorer': (c) => (c.token.explorerUrl = null),
  'explorer for another address': (c) => (c.token.explorerUrl = 'https://solscan.io/token/So11111111111111111111111111111111111111112'),
  'unknown network': (c) => (c.token.network = 'dogechain'),
  'invalid social link': (c) => (c.social.xUrl = 'x.com/frozenusd'),
  'origin with a path': (c) => (c.canonicalOrigin = 'https://frozen-usd-fixture.vercel.app/home'),
};

for (const [name, mutate] of Object.entries(invalidLive)) {
  test(`an invalid live configuration is rejected: ${name}`, () => {
    const config = liveFixture();
    mutate(config);
    assert.throws(() => resolveSiteConfig(config), SiteConfigError);
  });
}

test('pre-launch rejects half-configured launch values', () => {
  for (const field of ['contractAddress', 'tradeUrl', 'explorerUrl']) {
    const config = clone(siteConfig);
    config.token[field] = field === 'contractAddress' ? FIXTURE_SOLANA_ADDRESS : 'https://pump.fun/';
    assert.throws(() => resolveSiteConfig(config), SiteConfigError, field);
  }
});

test('pre-launch may announce a network without enabling anything live', () => {
  const config = clone(siteConfig);
  config.token.network = 'solana';
  assert.deepEqual(resolveSiteConfig(config).token, { status: 'prelaunch', networkLabel: 'Solana' });
});

test('optional social links render only when they are real HTTPS URLs', () => {
  const config = clone(siteConfig);
  config.social.xUrl = 'https://x.com/frozenusd_fixture';
  const site = resolveSiteConfig(config);
  assert.equal(site.social.xUrl, 'https://x.com/frozenusd_fixture');
  assert.equal(site.social.communityUrl, null);
});

test('URL validation never accepts empty or placeholder destinations', () => {
  for (const bad of [
    null,
    undefined,
    '',
    '#',
    'null',
    'undefined',
    'https://',
    'http://pump.fun',
    'https://localhost/x',
    'https://example.com',
    'https://www.example.org/path',
    'https://x.com/{{X_HANDLE}}',
    'https://x.com/[X_URL]',
    'https://x.com/TODO',
    'https://x.com/your-handle',
    ' https://x.com/frozenusd',
    'https://127.0.0.1/',
    'javascript:alert(1)',
  ]) {
    assert.equal(validateHttpsUrl(bad), null, String(bad));
  }
  assert.equal(validateHttpsUrl('https://pump.fun/coin/abc'), 'https://pump.fun/coin/abc');
  assert.equal(validateOrigin('https://frozenusd.com/'), 'https://frozenusd.com');
  assert.equal(validateOrigin('https://frozenusd.com/page'), null);
});

test('address syntax validation per network', () => {
  assert.equal(isValidAddress('solana', FIXTURE_SOLANA_ADDRESS), true);
  assert.equal(isValidAddress('solana', FIXTURE_SOLANA_ADDRESS + '0'), false);
  assert.equal(isValidAddress('solana', 'O0Il' + FIXTURE_SOLANA_ADDRESS.slice(4)), false);
  assert.equal(isValidAddress('ethereum', FIXTURE_EVM_ADDRESS), true);
  assert.equal(isValidAddress('base', '0x0000000000000000000000000000000000000000'), false);
  assert.equal(isValidAddress('bsc', '0x123'), false);
});
