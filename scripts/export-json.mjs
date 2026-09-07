#!/usr/bin/env node
/**
 * Exporta los datos a JSON puro.
 *
 *   npm run export:json
 *
 * La fuente de verdad es `public/data/places.js`, que es un .js para poder
 * cargarse sin servidor (ver docs/adr/0005). Pero un JSON de verdad sigue
 * haciendo falta para hablar con otras herramientas: cargar la colección en
 * Supabase, pasarla a QGIS, revisarla con `jq`.
 *
 * El archivo generado NO se versiona —está en .gitignore— precisamente para
 * que nadie lo confunda con el original ni lo edite por error.
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import "../public/data/places.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(ROOT, "public/data/places.json");

const document = globalThis.__QEA_PLACES__;
if (document === undefined) {
  console.error("public/data/places.js no define __QEA_PLACES__.");
  process.exit(1);
}

await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`, "utf8");

const count = Array.isArray(document) ? document.length : document.places.length;
console.log(`Exportados ${count} lugares a public/data/places.json`);
console.log("Recuerda: el original sigue siendo places.js. Este archivo no se versiona.");
