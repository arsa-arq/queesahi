#!/usr/bin/env node
/**
 * Servidor estático mínimo para desarrollo.
 *
 *   npm start          → http://localhost:8000
 *   npm start -- 3000  → otro puerto
 *
 * Hace falta un servidor porque la aplicación usa módulos ES y carga
 * `places.json` por fetch: al abrir index.html con doble clic, el navegador
 * bloquea ambas cosas por política de origen (protocolo file://).
 *
 * Sin dependencias a propósito: el proyecto debe poder arrancar en una máquina
 * recién instalada, con solo Node. Esto NO es un servidor de producción; el
 * despliegue va a Cloudflare Pages / Vercel / GitHub Pages (ARCHITECTURE.md, 16).
 */

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || process.env.PORT || 8000);

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json"
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const requested = decodeURIComponent(url.pathname);
  const relative = normalize(requested === "/" ? "/index.html" : requested).replace(/^[/\\]+/, "");
  const filePath = join(ROOT, relative);

  // Nadie debería poder salirse de la carpeta del proyecto con «../».
  if (!filePath.startsWith(ROOT + sep)) {
    response.writeHead(403).end("403 Prohibido");
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("no es un archivo");

    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": info.size,
      // En desarrollo conviene ver siempre el último cambio.
      "Cache-Control": "no-cache"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`404 · No existe ${requested}`);
  }
});

server.listen(PORT, () => {
  console.log(`¿Qué es ahí? · http://localhost:${PORT}`);
  console.log(`Sirviendo ${ROOT}`);
  console.log("Ctrl+C para detener.");
});
