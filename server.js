// Servidor estático para o Nexify DDNS Router: GET /api/health + arquivos permitidos.
import { bootService } from './nexify-router.js';
import { createGate } from './oauth-gate.js';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVICE = 'daillus-proposta';
// Prefixos servidos (nada fora disso: .env, backend, node_modules, scripts...).
const ALLOW = ['index.html', 'frontend/', 'proposta-dailus/', 'proposta-plataforma-influencers/', 'proposta-lab-dados/', 'data/'];
const ROBOTS = 'robots.txt';

const ROOT = dirname(fileURLToPath(import.meta.url));
const cfg = await bootService({ name: SERVICE, directory: ROOT, kind: 'spa' });
const host = process.env.HOST || cfg.host;
const port = Number(process.env.PORT || cfg.port);
const gate = createGate({ clientId: SERVICE, publicUrl: cfg.publicUrl, routerUrl: process.env.ROUTER_URL });

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

function allowed(p) {
  if (p.split('/').some((seg) => seg.startsWith('.'))) return false;
  return ALLOW.some((a) => (a.endsWith('/') ? p.startsWith(a) : p === a));
}

async function serveFile(req, res, file) {
  const info = await stat(file);
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = { 'content-type': type, 'x-robots-tag': 'noindex, nofollow', 'accept-ranges': 'bytes' };
  const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
  if (range) {
    const start = range[1] ? Number(range[1]) : info.size - Number(range[2]);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
    if (start > end || start < 0) { res.writeHead(416, { 'content-range': `bytes */${info.size}` }).end(); return; }
    res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${info.size}`, 'content-length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, { ...headers, 'content-length': info.size });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  let path = '/';
  try { path = decodeURIComponent((req.url || '/').split('?')[0]); } catch { res.writeHead(400).end(); return; }
  if (path === '/api/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  try {
    if (await gate(req, res, path)) return;
    if (path === '/robots.txt') return await serveFile(req, res, join(ROOT, ROBOTS));
    let rel = normalize(path).replace(/^\/+/, '');
    if (rel.includes('..')) { res.writeHead(400).end(); return; }
    let file = join(ROOT, rel);
    let info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      if (!path.endsWith('/')) { res.writeHead(301, { location: path + '/' }).end(); return; }
      rel = join(rel, 'index.html');
      file = join(ROOT, rel);
      info = await stat(file).catch(() => null);
    }
    if (!info?.isFile() || !allowed(rel)) { res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found'); return; }
    await serveFile(req, res, file);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500).end();
  }
});

try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  console.log(`${SERVICE} no ar em http://${host}:${port} → ${cfg.publicUrl}`);
} catch (error) {
  if (error?.code !== 'EADDRINUSE') throw error;
  const health = await fetch(`http://${host}:${port}/api/health`).then((r) => r.json()).catch(() => null);
  if (health?.ok === true) process.exit(0);
  throw error;
}
