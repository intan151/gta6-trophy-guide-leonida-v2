// Leonida Ledger v2 — tiny static server for local testing (Node 22,
// standard library only). Serves app/ at http://localhost:8080, the same
// root the guide expects when it is deployed. Run: node serve.ts
// (set PORT to listen on another port, e.g. PORT=8123 node serve.ts)

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const port = Number.parseInt(process.env.PORT || '8080', 10);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

createServer((req, res) => {
  const raw = decodeURIComponent((req.url || '/').split('?')[0]);
  const path = normalize(join(root, raw));
  const file = raw.endsWith('/') || path === root ? join(path, 'index.html') : path;
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found\n');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Leonida Ledger v2 at http://localhost:${port}`));
