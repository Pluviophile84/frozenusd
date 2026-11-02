/**
 * The resolved, validated configuration used by every page and component.
 * Throws at build time if src/config/site.ts describes an invalid live launch.
 */
import { siteConfig } from './site.ts';
import { resolveSiteConfig } from './schema.ts';

export const site = resolveSiteConfig(siteConfig, { vercelEnv: process.env.VERCEL_ENV });
export type { ResolvedSite, ResolvedToken, LiveToken } from './schema.ts';
