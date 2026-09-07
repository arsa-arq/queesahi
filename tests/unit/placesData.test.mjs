/**
 * Comprobaciones sobre el archivo de datos real.
 *
 * `npm run validate` es exhaustivo y da mensajes editoriales; esto es la red
 * de seguridad de `npm test`, para que nadie pueda romper los datos sin que
 * salte una prueba.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { embeddedPlaceRepository, html, types } from "../helpers/loadApp.mjs";
import "../../public/data/places.js";

const { parsePlacesDocument } = embeddedPlaceRepository;
const { isHexColor } = html;
const { PLACE_STATUSES } = types;

const places = parsePlacesDocument(globalThis.__QEA_PLACES__);

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

test("todos los colores son hexadecimales de seis dígitos", () => {
  for (const place of places) {
    if (place.color === undefined) continue;
    assert.ok(isHexColor(place.color), `color inválido en ${place.id}: ${place.color}`);
  }
});

test("los lugares publicados no repiten color ni emoji", () => {
  const published = places.filter((p) => p.status === "published");
  for (const field of ["color", "emoji"]) {
    const values = published.map((p) => p[field]).filter(Boolean);
    assert.equal(
      new Set(values).size,
      values.length,
      `hay ${field} repetidos entre los lugares publicados`
    );
  }
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
