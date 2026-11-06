/**
 * Frozen USD — launch configuration.
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
    name: 'Frozen USD',
    ticker: '$USDFU',
    slogan: 'Frozen. Still moving.',
  },

  /**
   * The purchased production domain. No path. Canonical URLs and the sitemap
   * are only emitted for a live production build (see schema.ts `indexable`);
   * pre-launch builds and previews stay noindex.
   */
  canonicalOrigin: 'https://frozenusd.com',

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
    /**
     * Set to true only after independently checking the deployed mint on the
     * explorer: freeze authority empty, and (for Token-2022) no extension that
     * lets the issuer block transfers. See docs/launch-checklist.md.
     */
    freezeAuthorityVerified: false,
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
