/**
 * FROZEN USD — launch configuration.
 *
 * This is the only file that needs to change when the token launches.
 * See docs/launch-checklist.md for the exact steps. The site is static:
 * after editing, commit and let Vercel rebuild and redeploy.
 *
 * Every launch value is null until it is real and verified.
 * Never put a placeholder, example or "coming soon" string in these fields.
 */
import type { SiteConfigInput } from './schema.ts';

export const siteConfig: SiteConfigInput = {
  brand: {
    name: 'FROZEN USD',
    ticker: '$FRZUSD',
    slogan: 'Frozen. Still moving.',
  },

  /** Verified public HTTPS origin, e.g. the final production domain. No path. */
  canonicalOrigin: null,

  token: {
    /** 'prelaunch' until every live value below is real and verified. */
    status: 'prelaunch',
    /** One of the networks in schema.ts (`NETWORKS`), e.g. 'solana' for pump.fun. */
    network: null,
    /** The token's real contract / mint address on that network. */
    contractAddress: null,
    /** HTTPS page where the token trades. */
    tradeUrl: null,
    /** HTTPS block-explorer page for this exact contract address. */
    explorerUrl: null,
  },

  social: {
    /** Official X profile, HTTPS. Hidden while null. */
    xUrl: null,
    /** Official community link (e.g. Telegram), HTTPS. Hidden while null. */
    communityUrl: null,
  },

  features: {
    /** Show the dated October 2026 editorial note in the satire section. */
    datedNews: true,
  },
};
