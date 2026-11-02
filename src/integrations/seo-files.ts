import { writeFile } from 'node:fs/promises';
import type { AstroIntegration } from 'astro';
import type { ResolvedSite } from '../config/schema.ts';

/**
 * Writes robots.txt for every build and sitemap.xml only for an indexable
 * (live, production, verified canonical origin) build, so a sitemap can never
 * contain localhost or guessed URLs.
 */
export function seoFiles(site: ResolvedSite): AstroIntegration {
  return {
    name: 'frozen-usd-seo-files',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const origin = site.indexable ? site.canonicalOrigin : null;
        const robots = origin
          ? `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
          : // Crawlers may fetch pages, but every page carries noindex until launch.
            'User-agent: *\nAllow: /\n';
        await writeFile(new URL('robots.txt', dir), robots);
        if (origin) {
          const sitemap =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            `  <url><loc>${origin}/</loc></url>\n` +
            '</urlset>\n';
          await writeFile(new URL('sitemap.xml', dir), sitemap);
        }
      },
    },
  };
}
