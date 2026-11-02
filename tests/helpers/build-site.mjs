// Builds the production site into <outDir>.
//   node tests/helpers/build-site.mjs <outDir>                 → the committed configuration
//   node tests/helpers/build-site.mjs <outDir> <fixture.json>  → a test fixture configuration
// With a fixture, src/config/site.ts is swapped for the fixture inside the
// build only; the committed file is never modified.
import { build } from 'astro';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const [outDir, fixtureJson] = process.argv.slice(2);
if (!outDir) throw new Error('Usage: build-site.mjs <outDir> [fixture.json]');

if (!fixtureJson) {
  await build({ root, outDir, logLevel: 'error' });
} else {
  const fixture = JSON.parse(await readFile(fixtureJson, 'utf8'));
  const dir = await mkdtemp(join(tmpdir(), 'frzusd-fixture-'));
  const fixtureModule = join(dir, 'site.mjs');
  await writeFile(fixtureModule, `export const siteConfig = ${JSON.stringify(fixture, null, 2)};\n`);

  // Mirrors astro.config.ts, with the fixture in place of src/config/site.ts.
  const { resolveSiteConfig } = await import(join(root, 'src/config/schema.ts'));
  const { seoFiles } = await import(join(root, 'src/integrations/seo-files.ts'));
  const site = resolveSiteConfig(fixture, { vercelEnv: process.env.VERCEL_ENV });

  await build({
    root,
    configFile: false,
    outDir,
    logLevel: 'error',
    output: 'static',
    site: site.canonicalOrigin ?? undefined,
    integrations: [seoFiles(site)],
    vite: {
      plugins: [
        {
          name: 'frozen-usd-test-fixture',
          enforce: 'pre',
          resolveId(source, importer) {
            if (source === './site.ts' && importer?.replaceAll('\\', '/').endsWith('/src/config/index.ts')) {
              return fixtureModule;
            }
            return null;
          },
        },
      ],
    },
  });
}
