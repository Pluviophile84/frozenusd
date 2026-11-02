import { defineConfig } from 'astro/config';
import { site } from './src/config/index.ts';
import { seoFiles } from './src/integrations/seo-files.ts';

// Static output for Vercel's Astro framework preset. No adapter is needed.
// Importing the config here validates src/config/site.ts before any page builds.
export default defineConfig({
  output: 'static',
  site: site.canonicalOrigin ?? undefined,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [seoFiles(site)],
});
