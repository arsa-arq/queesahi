#!/usr/bin/env node
/**
 * Genera una imagen provisional por lugar en `public/fotos/`.
 *
 *   npm run fotos:placeholders
 *
 * Existe porque el proyecto necesita ver la ficha con fotografía **antes** de
 * tener fotografías. Cada archivo es un SVG con el color de acento del lugar,
 * su emoji y la palabra «Fotografía pendiente», de modo que nadie lo confunda
 * con una imagen real ni lo dé por bueno en una demostración.
 *
 * Se sobrescriben solo los marcadores de posición: si ya existe una fotografía
 * de verdad con el mismo nombre, el script no la toca.
 *
 * Ver public/fotos/README.md para el flujo de reemplazo.
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import "../src/app/namespace.js";
import "../src/types/place.js";
import "../src/utils/html.js";
import "../public/data/places.js";

const { escapeHtml } = globalThis.QEA.html;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FOTOS = resolve(ROOT, "public/fotos");

/** Marca que identifica un archivo como generado por este script. */
const MARCA = "<!-- marcador-de-posicion:que-es-ahi -->";

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * @param {{ name: string, emoji?: string, color?: string }} place
 * @returns {string}
 */
function placeholderSvg(place) {
  const color = place.color || "#04437F";
  const emoji = place.emoji || "📍";
  const name = escapeHtml(place.name);

  return `${MARCA}
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="Fotografía pendiente de ${name}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="#04305C"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 40}" text-anchor="middle"
        font-size="150" opacity="0.85">${emoji}</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 70}" text-anchor="middle"
        font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="46" font-weight="700" fill="#ffffff" opacity="0.95">${name}</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 125}" text-anchor="middle"
        font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="26" letter-spacing="3" fill="#ffffff" opacity="0.6">FOTOGRAFÍA PENDIENTE</text>
</svg>
`;
}

/**
 * ¿Este archivo lo generamos nosotros? Si no, es una fotografía real y no se
 * toca bajo ningún concepto.
 * @param {string} path
 */
async function esMarcadorDePosicion(path) {
  if (!existsSync(path)) return true;
  try {
    const contenido = await readFile(path, "utf8");
    return contenido.includes(MARCA);
  } catch {
    return false; // binario ilegible como texto: es una foto de verdad
  }
}

async function main() {
  const document = globalThis.__QEA_PLACES__;
  const places = Array.isArray(document) ? document : document.places;

  await mkdir(FOTOS, { recursive: true });

  let escritos = 0;
  let respetados = 0;

  for (const place of places) {
    const destino = resolve(FOTOS, `${place.slug}.svg`);
    if (!(await esMarcadorDePosicion(destino))) {
      console.log(`  respetado  ${place.slug}.svg (no es un marcador de posición)`);
      respetados += 1;
      continue;
    }
    await writeFile(destino, placeholderSvg(place), "utf8");
    console.log(`  generado   ${place.slug}.svg`);
    escritos += 1;
  }

  console.log(`\n${escritos} marcadores generados, ${respetados} archivos respetados.`);
  console.log("Sustitúyelos por fotografías reales: ver public/fotos/README.md");
}

main();
