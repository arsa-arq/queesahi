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

import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import "../src/app/namespace.js";
import "../src/types/place.js";
import "../src/utils/html.js";
import "../public/data/places.js";

const { PLACE_STATUSES } = globalThis.QEA.types;
const { isHexColor, normalizeImage } = globalThis.QEA.html;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Nombres de archivo que generó `npm run fotos:placeholders`.
 *
 * Distinguir un marcador de posición de una fotografía real es lo que permite
 * exigirle a la segunda lo que a la primera no tiene sentido pedirle: una
 * descripción de lo que se ve y una autoría con licencia.
 */
function marcadoresGenerados() {
  const archivo = resolve(ROOT, "public/fotos/.marcadores.json");
  if (!existsSync(archivo)) return [];
  try {
    const datos = JSON.parse(readFileSync(archivo, "utf8"));
    return Array.isArray(datos.generados) ? datos.generados : [];
  } catch {
    return [];
  }
}

const MARCADORES = marcadoresGenerados();

/** Cuántas categorías debe tener el catálogo. Fijado por el equipo de la Cátedra. */
const NUMERO_DE_CATEGORIAS = 7;

/** Texto que delata un campo heredado del marcador y no actualizado. */
const TEXTO_DE_MARCADOR = /marcador de posici[oó]n|fotograf[ií]a pendiente/i;

const DATA_FILE = "public/data/places.js";

/** Caja aproximada de Bogotá D.C. Fuera de aquí, la coordenada está mal. */
const BOGOTA_BOUNDS = { minLat: 4.4, maxLat: 4.9, minLon: -74.3, maxLon: -73.95 };

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const REQUIRED_TEXT = ["id", "slug", "name", "summary", "description", "location"];
const OPTIONAL_TEXT = ["whyItMatters", "lookCloser", "historicalContext", "curiosity", "emoji"];
const REQUIRED_ARRAYS = ["tags", "sources"];

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
 * Comprueba la adscripción de un predio a la taxonomía de siete categorías.
 *
 * Un predio fuera del catálogo desaparecería del mapa en cuanto alguien use el
 * menú lateral, y el fallo se notaría tarde y mal.
 *
 * @param {Record<string, unknown>} place
 * @param {string} label
 * @param {Set<string>} idsValidos
 */
function validateCategoryIds(place, label, idsValidos) {
  const ids = place.categoryIds;

  if (!Array.isArray(ids)) {
    fail(`${label}: «categoryIds» debe ser un arreglo con al menos una categoría.`);
    return;
  }

  if (ids.length === 0) {
    fail(
      `${label}: no pertenece a ninguna categoría. Todo predio debe estar en ` +
        `una de las ${NUMERO_DE_CATEGORIAS}.`
    );
    return;
  }

  for (const id of ids) {
    if (!isNonEmptyString(id)) {
      fail(`${label}: «categoryIds» contiene una entrada vacía.`);
      continue;
    }
    if (idsValidos && !idsValidos.has(String(id))) {
      fail(`${label}: la categoría «${id}» no existe en el catálogo.`);
    }
  }

  if (new Set(ids).size !== ids.length) {
    warn(`${label}: «categoryIds» repite alguna categoría.`);
  }
}

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

    const nombreArchivo = image.src.split("/").pop() || "";
    const esMarcador = MARCADORES.includes(nombreArchivo);

    if (place.status === "published" && !image.alt.trim()) {
      fail(
        `${label}: la imagen${position} no tiene «alt». Describe lo que se ve, ` +
          `no repitas el nombre del lugar.`
      );
    }

    if (place.status === "published" && !esMarcador) {
      // Fotografía real: aquí sí se exige todo.
      if (TEXTO_DE_MARCADOR.test(image.alt)) {
        fail(
          `${label}: la imagen${position} ya es una fotografía real, pero su «alt» ` +
            `sigue describiendo el marcador de posición. Descríbe lo que se ve en la foto.`
        );
      }
      if (!image.credit.trim()) {
        fail(
          `${label}: la fotografía${position} no declara «credit». Ninguna imagen ` +
            `se publica sin autoría y licencia (ver public/fotos/README.md).`
        );
      } else if (TEXTO_DE_MARCADOR.test(image.credit)) {
        fail(
          `${label}: la fotografía${position} conserva el «credit» del marcador. ` +
            `Escribe quién la tomó y bajo qué licencia.`
        );
      }
    }

    if (place.status === "published" && esMarcador && !image.credit.trim()) {
      warn(`${label}: la imagen${position} no declara «credit».`);
    }

    // Peso: la herramienta se usa en la calle, con datos móviles.
    if (!esMarcador && !/^https?:\/\//i.test(image.src)) {
      const archivo = resolve(ROOT, image.src);
      if (existsSync(archivo)) {
        const kb = Math.round(statSync(archivo).size / 1024);
        if (kb > 300) {
          warn(
            `${label}: la fotografía${position} pesa ${kb} kB. El límite acordado ` +
              `son 300 kB (public/fotos/README.md).`
          );
        }
      }
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
function validatePlace(place, index, idsValidos) {
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

  validateCategoryIds(place, label, idsValidos);
  validateImages(place, label);

  if (place.color !== undefined) {
    warn(
      `${label}: «color» ya no se usa. El acento lo aporta la categoría del ` +
        `predio; puedes borrar el campo.`
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

  // El color ya no distingue lugares —agrupa categorías—, pero el emoji sí:
  // es lo único que diferencia dos marcadores de la misma categoría.
  for (const [value, ids] of duplicatesIn(published, "emoji")) {
    warn(`Dos lugares publicados comparten el emoji ${value}: ${ids.join(", ")}.`);
  }

  // Direcciones idénticas suelen ser un copiar y pegar sin corregir.
  for (const [value, ids] of duplicatesIn(published, "location")) {
    warn(`Misma dirección en varios lugares («${value}»): ${ids.join(", ")}. ¿Copiar y pegar?`);
  }

  if (published.length === 0) {
    fail("No hay ningún lugar publicado: la aplicación arrancaría vacía.");
  }
}

/**
 * Comprueba el catálogo de categorías.
 *
 * @param {Record<string, unknown>[]} categories
 */
function validateCategories(categories) {
  if (categories.length !== NUMERO_DE_CATEGORIAS) {
    fail(
      `El catálogo tiene ${categories.length} categorías y deben ser ` +
        `${NUMERO_DE_CATEGORIAS}.`
    );
  }

  categories.forEach((category, index) => {
    const label = isNonEmptyString(category.id) ? `«${category.id}»` : `categoría #${index + 1}`;

    if (!isNonEmptyString(category.id) || !KEBAB_CASE.test(String(category.id))) {
      fail(`${label}: «id» debe ir en kebab-case.`);
    }
    if (!isNonEmptyString(category.name)) {
      fail(`${label}: falta el nombre.`);
    }
    if (typeof category.number !== "number" || !Number.isInteger(category.number)) {
      fail(`${label}: «number» debe ser un entero.`);
    } else if (category.number < 1 || category.number > NUMERO_DE_CATEGORIAS) {
      fail(`${label}: «number» debe estar entre 1 y ${NUMERO_DE_CATEGORIAS}.`);
    }
    if (!isHexColor(category.color)) {
      fail(
        `${label}: «color» debe ser un hexadecimal de seis dígitos. ` +
          `Recibido: «${category.color}».`
      );
    }
  });

  /** @param {string} field */
  const repetidos = (field) => {
    /** @type {Map<string, number>} */
    const vistos = new Map();
    for (const category of categories) {
      const clave = String(category[field]);
      vistos.set(clave, (vistos.get(clave) || 0) + 1);
    }
    return [...vistos.entries()].filter(([, n]) => n > 1).map(([clave]) => clave);
  };

  for (const field of ["id", "number", "name"]) {
    for (const valor of repetidos(field)) {
      fail(`El catálogo repite «${field}»: ${valor}.`);
    }
  }

  // El color es lo que hace legible el mapa al filtrar: dos categorías del
  // mismo color serían indistinguibles.
  for (const valor of repetidos("color")) {
    fail(`Dos categorías comparten el color ${valor}: no se distinguirían en el mapa.`);
  }

  // Un nombre todavía sin decidir no es un error, pero conviene recordarlo.
  const provisionales = categories.filter((c) => /^Categor[ií]a \d+$/.test(String(c.name)));
  if (provisionales.length > 0) {
    warn(
      `${provisionales.length} categorías conservan su nombre provisional ` +
        `(«Categoría N»). Pendiente de que el equipo confirme los nombres.`
    );
  }

  // Contexto de la matriz de la Cátedra. No es obligatorio para que la
  // aplicación funcione, pero sin él la categoría es una etiqueta suelta: nadie
  // sabe desde dónde leer el predio ni qué debe contener su ficha.
  for (const category of categories) {
    const label = isNonEmptyString(category.id) ? `«${category.id}»` : "una categoría";
    const faltan = ["layer", "axis", "question", "studies", "evidence"].filter(
      (campo) => !isNonEmptyString(category[campo])
    );
    if (faltan.length > 0) {
      warn(
        `${label}: sin «${faltan.join("», «")}». Ese contexto sale de la matriz ` +
          `(docs/product/matriz-de-categorias.md).`
      );
    }
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

  const categories = Array.isArray(document.categories) ? document.categories : [];
  validateCategories(categories);

  const idsValidos = new Set(categories.map((c) => String(c.id)));
  places.forEach((place, index) => validatePlace(place, index, idsValidos));
  validateCollection(places);

  // Un predio sin categoría válida es invisible en cuanto se filtre.
  const sinCategoria = places.filter(
    (p) => !Array.isArray(p.categoryIds) || !p.categoryIds.some((id) => idsValidos.has(String(id)))
  );
  if (sinCategoria.length > 0) {
    fail(
      `${sinCategoria.length} predios no pertenecen a ninguna categoría válida: ` +
        sinCategoria.map((p) => p.id).join(", ")
    );
  }

  for (const message of warnings) console.warn(`  aviso  ${message}`);
  for (const message of errors) console.error(`  ERROR  ${message}`);

  const published = places.filter((p) => p.status === "published").length;
  const conFoto = places.filter((p) => Array.isArray(p.images) && p.images.length > 0).length;
  console.log(
    `\n${places.length} lugares (${published} publicados, ${conFoto} con fotografía) · ` +
      `${categories.length} categorías · ` +
      `${errors.length} errores · ${warnings.length} avisos`
  );

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
