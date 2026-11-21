import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const RAIZ = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = normalize(join(RAIZ, ruta));
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(archivo)).isDirectory()) { res.writeHead(301, { Location: ruta + '/' }).end(); return; }
    const cuerpo = await readFile(archivo);
    const tipo = TIPOS[extname(archivo)] || 'application/octet-stream';
    // Comprime y cachea como GitHub Pages, para que Lighthouse mida lo que se publica.
    const cabeceras = { 'Content-Type': tipo, 'Cache-Control': 'max-age=600' };
    if (/text|javascript|json|svg/.test(tipo) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      res.writeHead(200, { ...cabeceras, 'Content-Encoding': 'gzip' });
      res.end(gzipSync(cuerpo));
      return;
    }
    res.writeHead(200, cabeceras);
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end('no existe');
  }
}).listen(4173, '127.0.0.1');
