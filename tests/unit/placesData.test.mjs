/**
 * Comprobaciones sobre el archivo de datos real.
 *
 * `npm run validate` es exhaustivo y da mensajes editoriales; esto es la red
 * de seguridad de `npm test`, para que nadie pueda romper los datos sin que
 * salte una prueba.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { categoryService, embeddedPlaceRepository, html, types } from "../helpers/loadApp.mjs";
import "../../public/data/places.js";

const { parsePlacesDocument } = embeddedPlaceRepository;
const { isHexColor } = html;
const { PLACE_STATUSES } = types;
const { countByCategory, uncategorized, primaryCategory } = categoryService;

const documento = parsePlacesDocument(globalThis.__QEA_PLACES__);
const places = documento.places;
const categories = documento.categories;

test("hay lugares publicados", () => {
  assert.ok(places.filter((p) => p.status === "published").length >= 5);
});

test("todos los identificadores van en kebab-case y son únicos", () => {
  const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const place of places) {
    assert.match(place.id, pattern, `id inválido: ${place.id}`);
    assert.match(place.slug, pattern, `slug inválido: ${place.slug}`);
  }
  assert.equal(new Set(places.map((p) => p.id)).size, places.length);
  assert.equal(new Set(places.map((p) => p.slug)).size, places.length);
});

test("el catálogo tiene siete categorías, numeradas del 1 al 7", () => {
  assert.equal(categories.length, 7);
  assert.deepEqual(
    [...categories].map((c) => c.number).sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7]
  );
});

test("los colores del catálogo son hexadecimales válidos y distintos", () => {
  // Dos categorías del mismo color serían indistinguibles en el mapa, que es
  // justo lo que el filtro pretende hacer legible.
  for (const category of categories) {
    assert.ok(isHexColor(category.color), `color inválido en ${category.id}: ${category.color}`);
  }
  const colores = categories.map((c) => c.color);
  assert.equal(new Set(colores).size, colores.length, "hay colores repetidos en el catálogo");
});

test("los identificadores del catálogo son únicos", () => {
  const ids = categories.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("los lugares publicados no repiten emoji", () => {
  // El color agrupa por categoría; el emoji es lo único que distingue dos
  // marcadores de la misma categoría.
  const published = places.filter((p) => p.status === "published");
  const emojis = published.map((p) => p.emoji).filter(Boolean);
  assert.equal(new Set(emojis).size, emojis.length);
});

test("todo predio pertenece a una categoría del catálogo", () => {
  assert.deepEqual(
    uncategorized(places, categories).map((p) => p.id),
    [],
    "un predio fuera del catálogo desaparece en cuanto alguien filtre"
  );
});

test("cada predio tiene un color resoluble a partir de su categoría", () => {
  for (const place of places) {
    const category = primaryCategory(place, categories);
    assert.ok(category, `${place.id} no resuelve categoría`);
    assert.ok(isHexColor(category.color));
  }
});

test("los recuentos por categoría suman el total de predios categorizados", () => {
  const counts = countByCategory(places, categories);
  const suma = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(suma, places.length);
});

test("las coordenadas caen dentro de Bogotá", () => {
  for (const place of places) {
    assert.ok(place.latitude > 4.4 && place.latitude < 4.9, `latitud fuera de rango: ${place.id}`);
    assert.ok(
      place.longitude > -74.3 && place.longitude < -73.95,
      `longitud fuera de rango: ${place.id}`
    );
  }
});

test("el estado editorial es uno de los definidos", () => {
  for (const place of places) {
    assert.ok(PLACE_STATUSES.includes(place.status), `estado inválido en ${place.id}`);
  }
});

test("todo lugar publicado cita al menos una fuente", () => {
  for (const place of places.filter((p) => p.status === "published")) {
    assert.ok(place.sources.length > 0, `${place.id} no cita fuentes`);
  }
});

test("cada lugar publicado declara una fotografía utilizable", () => {
  const { firstImage } = html;
  for (const place of places.filter((p) => p.status === "published")) {
    const image = firstImage(place);
    assert.ok(image, `${place.id} no tiene fotografía`);
    assert.ok(image.alt.trim(), `${place.id}: la fotografía no tiene alt`);
  }
});

test("los archivos de fotografía referenciados existen", async () => {
  const { existsSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const raiz = fileURLToPath(new URL("../../", import.meta.url));
  const { firstImage } = html;
  for (const place of places) {
    const image = firstImage(place);
    if (!image || /^https?:\/\//i.test(image.src)) continue;
    assert.ok(existsSync(raiz + image.src), `falta el archivo ${image.src} (${place.id})`);
  }
});
