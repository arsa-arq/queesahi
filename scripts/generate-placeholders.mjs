#!/usr/bin/env node
/**
 * Genera una imagen provisional por lugar en `public/fotos/`.
 *
 *   npm run fotos:placeholders
 *
 * Existe porque el proyecto necesita ver la ficha con fotografía **antes** de
 * tener fotografías. Cada archivo lleva el color de acento del lugar, su emoji
 * y la palabra «Fotografía pendiente», de modo que nadie lo confunda con una
 * imagen real ni lo dé por bueno en una demostración.
 *
 * Salen en **PNG**, no en SVG, por una razón práctica: el Explorador de
 * Windows no genera miniaturas de SVG, así que la carpeta parecía vacía de
 * imágenes. Un PNG se ve en la miniatura, en la vista previa y en cualquier
 * visor, igual que se verán las fotografías de verdad.
 *
 * La conversión la hace un navegador basado en Chromium en modo sin interfaz.
 * Es una dependencia solo de este script, no de la aplicación: los PNG
 * generados se versionan, así que nadie necesita ejecutarlo para ver la
 * herramienta funcionando.
 *
 * Nunca sobrescribe una fotografía real: solo toca los archivos que él mismo
 * anotó en `.marcadores.json`.
 */

import { writeFile, readFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

import "../src/app/namespace.js";
import "../src/types/place.js";
import "../src/utils/html.js";
import "../public/data/places.js";

const run = promisify(execFile);
const { escapeHtml } = globalThis.QEA.html;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FOTOS = resolve(ROOT, "public/fotos");
const MANIFIESTO = resolve(FOTOS, ".marcadores.json");

const WIDTH = 1200;
const HEIGHT = 630;

/** Navegadores donde buscar el modo sin interfaz, en orden de preferencia. */
const NAVEGADORES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
];

function buscarNavegador() {
  return NAVEGADORES.find((ruta) => existsSync(ruta)) || null;
}

/**
 * @param {{ name: string, emoji?: string, color?: string }} place
 * @returns {string}
 */
function placeholderSvg(place) {
  const color = place.color || "#04437F";
  const emoji = place.emoji || "📍";
  const name = escapeHtml(place.name);

  // Color plano y no degradado: un degradado suave obliga al PNG a tramar y
  // dispara el peso a ~300 kB por archivo, justo lo que public/fotos/README.md
  // prohíbe para las fotografías reales. En plano bajan a unas decenas de kB.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${color}"/>
  <rect y="${HEIGHT - 140}" width="${WIDTH}" height="140" fill="#04305C" opacity="0.35"/>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 40}" text-anchor="middle"
        font-size="150" opacity="0.9">${emoji}</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 70}" text-anchor="middle"
        font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="46" font-weight="700" fill="#ffffff" opacity="0.95">${name}</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 125}" text-anchor="middle"
        font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="26" letter-spacing="3" fill="#ffffff" opacity="0.65">FOTOGRAFÍA PENDIENTE</text>
</svg>`;
}

/** @returns {Promise<string[]>} nombres de archivo generados por este script */
async function leerManifiesto() {
  if (!existsSync(MANIFIESTO)) return [];
  try {
    const datos = JSON.parse(await readFile(MANIFIESTO, "utf8"));
    return Array.isArray(datos.generados) ? datos.generados : [];
  } catch {
    return [];
  }
}

async function main() {
  const navegador = buscarNavegador();
  if (!navegador) {
    console.error("No se encontró Chrome ni Edge para convertir las imágenes a PNG.");
    console.error("Instala uno de los dos, o pon fotografías reales en public/fotos/.");
    console.error("La aplicación funciona igual: sin imagen, la ficha usa el degradado de marca.");
    process.exit(1);
  }

  const document = globalThis.__QEA_PLACES__;
  const places = Array.isArray(document) ? document : document.places;

  await mkdir(FOTOS, { recursive: true });
  const yaGenerados = await leerManifiesto();

  const temporal = resolve(FOTOS, "._temporal.svg");
  /** @type {string[]} */
  const generados = [];
  let respetados = 0;

  for (const place of places) {
    const nombre = `${place.slug}.png`;
    const destino = resolve(FOTOS, nombre);

    // Un archivo que existe y no está en el manifiesto es una fotografía real.
    if (existsSync(destino) && !yaGenerados.includes(nombre)) {
      console.log(`  respetado  ${nombre} (no lo generó este script)`);
      respetados += 1;
      generados.push(...[]); // no entra al manifiesto: no es nuestro
      continue;
    }

    await writeFile(temporal, placeholderSvg(place), "utf8");
    await run(navegador, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--window-size=${WIDTH},${HEIGHT}`,
      `--screenshot=${destino}`,
      pathToFileURL(temporal).href
    ]);

    console.log(`  generado   ${nombre}`);
    generados.push(nombre);
  }

  await rm(temporal, { force: true });

  await writeFile(
    MANIFIESTO,
    `${JSON.stringify(
      {
        "//": "Archivos que generó scripts/generate-placeholders.mjs. Se pueden sobrescribir. Cualquier otra imagen de esta carpeta se respeta.",
        generadoEl: new Date().toISOString().slice(0, 10),
        generados
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`\n${generados.length} marcadores generados, ${respetados} archivos respetados.`);
  console.log("Sustitúyelos por fotografías reales: ver public/fotos/README.md");
}

main();
