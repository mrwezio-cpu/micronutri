// Server statico minimo per lo sviluppo (nessuna dipendenza): npm start
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT) || 5173;
// Solo questo computer (IPv4 e IPv6); HOST=0.0.0.0 per esporlo in rete locale.
const hosts = process.env.HOST ? [process.env.HOST] : ['127.0.0.1', '::1'];
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

async function handle(req, res) {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(join(root, normalize(path)));
    if (!file.startsWith(root + sep)) throw new Error('fuori dalla cartella');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Non trovato');
  }
}

for (const host of hosts) {
  createServer(handle)
    .on('error', err => console.warn(`Impossibile ascoltare su ${host}:${port} (${err.code})`))
    .listen(port, host);
}
console.log(`MicroNutri su http://localhost:${port}`);
