// Minimal static file server for tests: serves a built `dist` directory and
// falls back to 404.html with a 404 status, like Vercel's static hosting.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.json': 'application/json',
};

export async function startStaticServer(root) {
  const base = resolve(root);
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      let path = normalize(join(base, decodeURIComponent(url.pathname)));
      if (!path.startsWith(base)) throw new Error('outside root');
      const info = await stat(path).catch(() => null);
      if (info?.isDirectory()) path = join(path, 'index.html');
      const body = await readFile(path);
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      const body = await readFile(join(base, '404.html')).catch(() => 'Not found');
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(body);
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const { port } = server.address();
  return { origin: `http://127.0.0.1:${port}`, close: () => new Promise((done) => server.close(done)) };
}
