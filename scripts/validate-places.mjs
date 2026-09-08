#!/usr/bin/env node
/**
 * Validador de public/data/places.js.
 *
 * Existe por una razón concreta: los defectos que llegaron a producción en la
 * versión anterior eran todos detectables por una máquina —un color escrito
 * como `#7C8B4A;`, un id con espacios y mayúsculas, una dirección copiada de
 * otro lugar, dos lugares con el mismo emoji—. Este script los convierte en un
 * fallo de la integración continua en vez de en algo que alguien tiene que
 * notar leyendo.
 *
 *   npm run validate
 *
 * Sale con código 1 si hay errores. Los avisos no rompen la construcción.
 */

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import "../src/app/namespace.js";
import "../src/types/place.js";
import "../src/utils/html.js";
import "../public/data/places.js";

const { PLACE_STATUSES } = globalThis.QEA.types;
const { isHexColor, normalizeImage } = globalThis.QEA.html;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const DATA_FILE = "public/data/places.js";

/** Caja aproximada de Bogotá D.C. Fuera de aquí, la coordenada está mal. */
const BOGOTA_BOUNDS = { minLat: 4.4, maxLat: 4.9, minLon: -74.3, maxLon: -73.95 };

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const REQUIRED_TEXT = ["id", "slug", "name", "summary", "description", "location"];
const OPTIONAL_TEXT = ["whyItMatters", "lookCloser", "historicalContext", "curiosity", "emoji"];
const REQUIRED_ARRAYS = ["categories", "sources"];

/** @type {string[]} */
const errors = [];
/** @type {string[]} */
const warnings = [];

/** @param {string} message */
const fail = (message) => errors.push(message);
/** @param {string} message */
const warn = (message) => warnings.push(message);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

/**
 * Comprueba las fotografías de un lugar.
 *
 * Las tres reglas responden a fallos concretos: una ruta con esquema raro es
 * un vector de inyección; una imagen sin `alt` deja fuera a quien usa lector
 * de pantalla; y una referencia a un archivo inexistente hace que la ficha
 * caiga al degradado sin que nadie se entere.
 *
 * @param {Record<string, unknown>} place
 * @param {string} label
 */
function validateImages(place, label) {
  const images = place.images;
  if (!Array.isArray(images)) {
    fail(`${label}: «images» debe ser un arreglo (usa [] si no hay fotografía).`);
    return;
  }

  images.forEach((entry, index) => {
    const position = images.length > 1 ? ` #${index + 1}` : "";
    const image = normalizeImage(entry);

    if (!image) {
      fail(
        `${label}: la imagen${position} no tiene una ruta utilizable. ` +
          `Usa una ruta del proyecto («public/fotos/x.jpg») o una URL http(s).`
      );
      return;
    }

    if (place.status === "published" && !image.alt.trim()) {
      fail(
        `${label}: la imagen${position} no tiene «alt». Describe lo que se ve, ` +
          `no repitas el nombre del lugar.`
      );
    }

    if (place.status === "published" && !image.credit.trim()) {
      warn(`${label}: la imagen${position} no declara «credit» (autoría y licencia).`);
    }

    // Solo se puede comprobar la existencia de las rutas locales.
    if (!/^https?:\/\//i.test(image.src) && !existsSync(resolve(ROOT, image.src))) {
      warn(
        `${label}: la imagen${position} apunta a «${image.src}», que no existe. ` +
          `La ficha mostrará el degradado de marca.`
      );
    }
  });
}

/**
 * @param {Record<string, unknown>} place
 * @param {number} index
 */
function validatePlace(place, index) {
  const label = isNonEmptyString(place.id) ? `«${place.id}»` : `#${index + 1}`;

  for (const field of REQUIRED_TEXT) {
    if (!isNonEmptyString(place[field])) {
      fail(`${label}: falta el campo obligatorio «${field}» o está vacío.`);
    }
  }

  for (const field of [...REQUIRED_TEXT, ...OPTIONAL_TEXT]) {
    const value = place[field];
    if (typeof value === "string" && value !== value.trim()) {
      warn(`${label}: «${field}» tiene espacios sobrantes al principio o al final.`);
    }
  }

  for (const field of ["id", "slug"]) {
    const value = place[field];
    if (isNonEmptyString(value) && !KEBAB_CASE.test(/** @type {string} */ (value))) {
      fail(
        `${label}: «${field}» debe ir en kebab-case (minúsculas, sin tildes ni espacios). Recibido: «${value}».`
      );
    }
  }

  for (const field of ["latitude", "longitude"]) {
    const value = place[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      fail(`${label}: «${field}» debe ser un número.`);
    }
  }

  const { latitude, longitude } = /** @type {{latitude: number, longitude: number}} */ (place);
  if (typeof latitude === "number" && typeof longitude === "number") {
    const inside =
      latitude >= BOGOTA_BOUNDS.minLat &&
      latitude <= BOGOTA_BOUNDS.maxLat &&
      longitude >= BOGOTA_BOUNDS.minLon &&
      longitude <= BOGOTA_BOUNDS.maxLon;
    if (!inside) {
      fail(`${label}: la coordenada (${latitude}, ${longitude}) cae fuera de Bogotá.`);
    }
  }

  if (!PLACE_STATUSES.includes(/** @type {any} */ (place.status))) {
    fail(`${label}: «status» debe ser uno de ${PLACE_STATUSES.join(", ")}.`);
  }

  for (const field of REQUIRED_ARRAYS) {
    const value = place[field];
    if (!Array.isArray(value)) {
      fail(`${label}: «${field}» debe ser un arreglo.`);
      continue;
    }
    if (value.some((item) => !isNonEmptyString(item))) {
      fail(`${label}: «${field}» contiene entradas vacías o que no son texto.`);
    }
  }

  // Regla editorial: nada se publica sin decir de dónde salió.
  if (place.status === "published" && Array.isArray(place.sources) && place.sources.length === 0) {
    fail(`${label}: un lugar publicado debe citar al menos una fuente.`);
  }

  validateImages(place, label);

  if (place.color !== undefined && !isHexColor(place.color)) {
    fail(
      `${label}: «color» debe ser un hexadecimal de seis dígitos como «#04437F». Recibido: «${place.color}».`
    );
  }

  for (const field of ["createdAt", "updatedAt"]) {
    const value = place[field];
    if (!isNonEmptyString(value) || !ISO_DATE.test(/** @type {string} */ (value))) {
      fail(`${label}: «${field}» debe tener el formato YYYY-MM-DD.`);
    }
  }

  if (
    ISO_DATE.test(String(place.createdAt)) &&
    ISO_DATE.test(String(place.updatedAt)) &&
    String(place.updatedAt) < String(place.createdAt)
  ) {
    fail(`${label}: «updatedAt» es anterior a «createdAt».`);
  }
}

/**
 * Comprobaciones que solo tienen sentido mirando el conjunto.
 * @param {Record<string, unknown>[]} places
 */
function validateCollection(places) {
  /** @param {string} field */
  const duplicatesOf = (field) => {
    /** @type {Map<string, string[]>} */
    const seen = new Map();
    for (const place of places) {
      const value = place[field];
      if (!isNonEmptyString(value)) continue;
      const key = String(value);
      seen.set(key, [...(seen.get(key) || []), String(place.id)]);
    }
    return [...seen.entries()].filter(([, ids]) => ids.length > 1);
  };

  for (const field of ["id", "slug"]) {
    for (const [value, ids] of duplicatesOf(field)) {
      fail(`«${field}» repetido: «${value}» aparece en ${ids.length} lugares.`);
    }
  }

  const published = places.filter((place) => place.status === "published");

  // El color y el emoji son cómo se distingue un pin de otro en el mapa.
  // Repetirlos no rompe nada, pero sí confunde a quien mira.
  /** @param {Record<string, unknown>[]} list @param {string} field */
  const duplicatesIn = (list, field) => {
    /** @type {Map<string, string[]>} */
    const seen = new Map();
    for (const place of list) {
      const value = place[field];
      if (!isNonEmptyString(value)) continue;
      const key = String(value);
      seen.set(key, [...(seen.get(key) || []), String(place.id)]);
    }
    return [...seen.entries()].filter(([, ids]) => ids.length > 1);
  };

  for (const field of ["color", "emoji"]) {
    for (const [value, ids] of duplicatesIn(published, field)) {
      warn(`Dos lugares publicados comparten «${field}» ${value}: ${ids.join(", ")}.`);
    }
  }

  // Direcciones idénticas suelen ser un copiar y pegar sin corregir.
  for (const [value, ids] of duplicatesIn(published, "location")) {
    warn(`Misma dirección en varios lugares («${value}»): ${ids.join(", ")}. ¿Copiar y pegar?`);
  }

  if (published.length === 0) {
    fail("No hay ningún lugar publicado: la aplicación arrancaría vacía.");
  }
}

function main() {
  const document = globalThis.__QEA_PLACES__;
  if (document === undefined) {
    console.error(`${DATA_FILE} no define __QEA_PLACES__.`);
    process.exit(1);
  }

  const places = Array.isArray(document) ? document : document.places;
  if (!Array.isArray(places)) {
    console.error("places.json debe contener un arreglo «places».");
    process.exit(1);
  }

  places.forEach(validatePlace);
  validateCollection(places);

  for (const message of warnings) console.warn(`  aviso  ${message}`);
  for (const message of errors) console.error(`  ERROR  ${message}`);

  const published = places.filter((p) => p.status === "published").length;
  const conFoto = places.filter((p) => Array.isArray(p.images) && p.images.length > 0).length;
  console.log(
    `\n${places.length} lugares (${published} publicados, ${conFoto} con fotografía) · ` +
      `${errors.length} errores · ${warnings.length} avisos`
  );

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
