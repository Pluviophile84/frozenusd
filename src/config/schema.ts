/**
 * Types and validation for src/config/site.ts.
 *
 * resolveSiteConfig() turns the raw configuration into the values the pages
 * render. It throws a SiteConfigError when the owner sets `status: 'live'`
 * without complete, well-formed launch values, so a misleading live page can
 * never be built.
 *
 * Address validation only checks syntax for the chosen network. It does not
 * prove that the token exists on-chain or what permissions it has.
 */

export const NETWORKS = {
  solana: { label: 'Solana', addressFormat: 'base58' },
  ethereum: { label: 'Ethereum', addressFormat: 'evm' },
  base: { label: 'Base', addressFormat: 'evm' },
  bsc: { label: 'BNB Smart Chain', addressFormat: 'evm' },
} as const;

export type NetworkKey = keyof typeof NETWORKS;
export type TokenStatus = 'prelaunch' | 'live';

export interface SiteConfigInput {
  brand: {
    name: string;
    ticker: string;
    slogan: string;
  };
  canonicalOrigin: string | null;
  token: {
    status: TokenStatus;
    network: NetworkKey | null;
    contractAddress: string | null;
    tradeUrl: string | null;
    explorerUrl: string | null;
  };
  social: {
    xUrl: string | null;
    communityUrl: string | null;
  };
  features: {
    datedNews: boolean;
  };
}

export interface LiveToken {
  status: 'live';
  networkLabel: string;
  contractAddress: string;
  tradeUrl: string;
  explorerUrl: string;
}

export interface PrelaunchToken {
  status: 'prelaunch';
  /** A network may be announced before launch; null shows "To be announced". */
  networkLabel: string | null;
}

export type ResolvedToken = LiveToken | PrelaunchToken;

export interface ResolvedSite {
  brand: SiteConfigInput['brand'];
  token: ResolvedToken;
  social: { xUrl: string | null; communityUrl: string | null };
  features: SiteConfigInput['features'];
  /** Verified origin without trailing slash, or null. */
  canonicalOrigin: string | null;
  /** True only for a live production build with a verified canonical origin. */
  indexable: boolean;
}

export interface BuildEnvironment {
  /** Vercel's VERCEL_ENV: 'production' | 'preview' | 'development' | undefined locally. */
  vercelEnv?: string | undefined;
}

export class SiteConfigError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(
      'Invalid FROZEN USD launch configuration (src/config/site.ts):\n' +
        problems.map((p) => `  - ${p}`).join('\n') +
        '\nSee docs/launch-checklist.md.',
    );
    this.name = 'SiteConfigError';
    this.problems = problems;
  }
}

// Template tokens anywhere, or placeholder words standing alone between
// delimiters (so random base58 address characters can never trip it).
const PLACEHOLDER_PATTERN =
  /[{}[\]<>]|\$\{|your[_-]|coming[-_ ]?soon|(^|[^a-z0-9])(todo|tbd|placeholder|example|undefined|null|changeme|x{3,})([^a-z0-9]|$)/i;

const RESERVED_HOST_PATTERN =
  /(^|\.)(example\.(com|org|net)|localhost|test|invalid|local)$/i;

/** Returns the normalised URL string if `value` is a usable public HTTPS URL. */
export function validateHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed !== value) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  const host = url.hostname;
  if (!host.includes('.') || RESERVED_HOST_PATTERN.test(host)) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(url.href);
  } catch {
    return null;
  }
  if (PLACEHOLDER_PATTERN.test(decoded)) return null;
  return url.href;
}

/** Returns the origin (no trailing slash) if `value` is a bare HTTPS origin. */
export function validateOrigin(value: unknown): string | null {
  const href = validateHttpsUrl(value);
  if (!href) return null;
  const url = new URL(href);
  if (url.pathname !== '/' || url.search || url.hash) return null;
  return url.origin;
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** Decodes a base58 string, or returns null if it contains invalid characters. */
export function decodeBase58(value: string): Uint8Array | null {
  const bytes: number[] = [];
  for (const char of value) {
    let carry = BASE58_ALPHABET.indexOf(char);
    if (carry < 0) return null;
    for (let i = 0; i < bytes.length; i++) {
      carry += (bytes[i] ?? 0) * 58;
      bytes[i] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const char of value) {
    if (char !== '1') break;
    bytes.push(0);
  }
  return Uint8Array.from(bytes.reverse());
}

/** Syntax check only: a well-formed, non-trivial address for the network. */
export function isValidAddress(network: NetworkKey, address: unknown): address is string {
  if (typeof address !== 'string' || address !== address.trim()) return false;
  const format = NETWORKS[network].addressFormat;
  if (format === 'evm') {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return false;
    return !/^0x0{40}$/i.test(address);
  }
  if (address.length < 32 || address.length > 44) return false;
  const decoded = decodeBase58(address);
  if (!decoded || decoded.length !== 32) return false;
  return decoded.some((byte) => byte !== 0);
}

function isNetworkKey(value: unknown): value is NetworkKey {
  return typeof value === 'string' && Object.hasOwn(NETWORKS, value);
}

export function resolveSiteConfig(
  input: SiteConfigInput,
  env: BuildEnvironment = {},
): ResolvedSite {
  const problems: string[] = [];
  const { token } = input;

  if (token.status !== 'prelaunch' && token.status !== 'live') {
    problems.push(`token.status must be 'prelaunch' or 'live' (got ${JSON.stringify(token.status)}).`);
  }

  if (token.network !== null && !isNetworkKey(token.network)) {
    problems.push(
      `token.network must be null or one of: ${Object.keys(NETWORKS).join(', ')} (got ${JSON.stringify(token.network)}).`,
    );
  }

  // Optional HTTPS links: a value that is set must be valid, never silently dropped.
  const optionalUrl = (field: string, value: string | null): string | null => {
    if (value === null) return null;
    const valid = validateHttpsUrl(value);
    if (!valid) problems.push(`${field} must be null or a real public HTTPS URL (got ${JSON.stringify(value)}).`);
    return valid;
  };

  const xUrl = optionalUrl('social.xUrl', input.social.xUrl);
  const communityUrl = optionalUrl('social.communityUrl', input.social.communityUrl);

  let canonicalOrigin: string | null = null;
  if (input.canonicalOrigin !== null) {
    canonicalOrigin = validateOrigin(input.canonicalOrigin);
    if (!canonicalOrigin) {
      problems.push(
        `canonicalOrigin must be null or a bare HTTPS origin such as https://your-domain (got ${JSON.stringify(input.canonicalOrigin)}).`,
      );
    }
  }

  const network = isNetworkKey(token.network) ? token.network : null;
  let resolvedToken: ResolvedToken;

  if (token.status === 'live') {
    if (!network) problems.push('Live mode requires token.network.');
    if (network && !isValidAddress(network, token.contractAddress)) {
      problems.push(
        `Live mode requires token.contractAddress to be a valid ${NETWORKS[network].label} address (got ${JSON.stringify(token.contractAddress)}).`,
      );
    }
    const tradeUrl = validateHttpsUrl(token.tradeUrl);
    if (!tradeUrl) {
      problems.push(`Live mode requires token.tradeUrl to be a real HTTPS URL (got ${JSON.stringify(token.tradeUrl)}).`);
    }
    const explorerUrl = validateHttpsUrl(token.explorerUrl);
    if (!explorerUrl) {
      problems.push(
        `Live mode requires token.explorerUrl to be a real HTTPS URL (got ${JSON.stringify(token.explorerUrl)}).`,
      );
    } else if (typeof token.contractAddress === 'string') {
      const caseInsensitive = network ? NETWORKS[network].addressFormat === 'evm' : false;
      const haystack = caseInsensitive ? explorerUrl.toLowerCase() : explorerUrl;
      const needle = caseInsensitive ? token.contractAddress.toLowerCase() : token.contractAddress;
      if (!haystack.includes(needle)) {
        problems.push('token.explorerUrl must point to the configured contract address.');
      }
    }
    resolvedToken = {
      status: 'live',
      networkLabel: network ? NETWORKS[network].label : '',
      contractAddress: token.contractAddress ?? '',
      tradeUrl: tradeUrl ?? '',
      explorerUrl: explorerUrl ?? '',
    };
  } else {
    // Pre-launch: launch-only values must stay empty so nothing half-configured renders.
    if (token.contractAddress !== null) {
      problems.push('token.contractAddress must stay null while status is prelaunch. Set status to live at launch.');
    }
    if (token.tradeUrl !== null) problems.push('token.tradeUrl must stay null while status is prelaunch.');
    if (token.explorerUrl !== null) problems.push('token.explorerUrl must stay null while status is prelaunch.');
    resolvedToken = { status: 'prelaunch', networkLabel: network ? NETWORKS[network].label : null };
  }

  if (problems.length > 0) throw new SiteConfigError(problems);

  const isPreviewOrDev = env.vercelEnv === 'preview' || env.vercelEnv === 'development';
  const indexable = resolvedToken.status === 'live' && canonicalOrigin !== null && !isPreviewOrDev;

  return {
    brand: input.brand,
    token: resolvedToken,
    social: { xUrl, communityUrl },
    features: input.features,
    canonicalOrigin,
    indexable,
  };
}
