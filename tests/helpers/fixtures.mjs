// Test-only launch fixtures. These values never appear in src/config/site.ts.
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58(bytes) {
  let value = 0n;
  for (const byte of bytes) value = value * 256n + BigInt(byte);
  let out = '';
  while (value > 0n) {
    out = ALPHABET[Number(value % 58n)] + out;
    value /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    out = '1' + out;
  }
  return out;
}

/** A syntactically valid, deliberately meaningless 32-byte Solana-format address. */
export const FIXTURE_SOLANA_ADDRESS = base58(Uint8Array.from({ length: 32 }, (_, i) => (i * 37 + 11) % 256));
export const FIXTURE_EVM_ADDRESS = '0x' + 'ab12'.repeat(10);

export function liveFixture() {
  return {
    brand: { name: 'Frozen USD', ticker: '$FUSD', slogan: 'Frozen. Still moving.' },
    canonicalOrigin: 'https://frozen-usd-fixture.vercel.app',
    token: {
      status: 'live',
      network: 'solana',
      contractAddress: FIXTURE_SOLANA_ADDRESS,
      tradeUrl: `https://pump.fun/coin/${FIXTURE_SOLANA_ADDRESS}`,
      explorerUrl: `https://solscan.io/token/${FIXTURE_SOLANA_ADDRESS}`,
    },
    social: { xUrl: 'https://x.com/frozenusd_fixture', communityUrl: null },
    features: { datedNews: true },
  };
}
