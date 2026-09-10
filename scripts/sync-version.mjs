#!/usr/bin/env node
/**
 * Sella los archivos que carga index.html con la versión del proyecto.
 *
 *   npm run version:sync
 *
 * Cada `<link>` y `<script>` local termina en `?v=0.3.0`. Así, al publicar una
 * versión nueva, el navegador se ve obligado a pedir de nuevo el CSS y el JS en
 * vez de reutilizar los que tenga guardados.
 *
 * Sin esto pasa lo siguiente, y ya pasó: GitHub Pages sirve todo con
 * `Cache-Control: max-age=600`, así que tras publicar un cambio un visitante
 * que ya había entrado puede recibir el `index.html` nuevo junto al `app.css` y
 * el `main.js` viejos. El resultado no es «la versión anterior»: es un híbrido
 * roto —marcado nuevo sin sus estilos ni su lógica— con partes sueltas por la
 * pantalla.
 *
 * Con el sello, un caché desactualizado devuelve la versión anterior **entera y
 * coherente**, que es un fallo aceptable, y nunca una mezcla.
 *
 * `npm test` comprueba que el sello coincida con package.json, de modo que
 * olvidarse de ejecutar esto se detecta antes de publicar.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = resolve(ROOT, "index.html");

/** Marca los `src`/`href` locales; los que van a un CDN se dejan intactos. */
const LOCAL_ASSET = /(\s(?:src|href)=")(?!https?:|#)([^"?]+\.(?:js|css))(?:\?v=[^"]*)?(")/g;

/**
 * Reescribe el sello de versión de todos los archivos locales.
 * @param {string} html
 * @param {string} version
 * @returns {{ html: string, count: number }}
 */
export function stampVersion(html, version) {
  let count = 0;
  const out = html.replace(LOCAL_ASSET, (_match, before, path, after) => {
    count += 1;
    return `${before}${path}?v=${version}${after}`;
  });
  return { html: out, count };
}

async function main() {
  const { version } = JSON.parse(await readFile(resolve(ROOT, "package.json"), "utf8"));
  const original = await readFile(INDEX, "utf8");
  const { html, count } = stampVersion(original, version);

  if (html === original) {
    console.log(`index.html ya está sellado con la versión ${version} (${count} archivos).`);
    return;
  }

  await writeFile(INDEX, html, "utf8");
  console.log(`Sellados ${count} archivos de index.html con la versión ${version}.`);
}

// Solo se ejecuta cuando se invoca como script, no al importarlo desde una prueba.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
