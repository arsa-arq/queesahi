/**
 * Capas de lectura con contenido propio (ADR 0006).
 *
 * Un lugar puede registrar una, varias o las siete capas, y pertenece a una
 * capa si y solo si tiene contenido en ella. Estas pruebas fijan esa regla
 * tanto en el servicio como en los datos reales.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { categoryService, embeddedPlaceRepository } from "../helpers/loadApp.mjs";
import "../../public/data/places.js";

const { categoryIdsOf, layersOf, filterByCategories, countByCategory, primaryCategory, hasContent } =
  categoryService;

const CATALOGO = [
  { id: "categoria-3", number: 3, name: "Poblacional", color: "#7C8B4A" },
  { id: "categoria-1", number: 1, name: "Histórica", color: "#C74A2C" },
  { id: "categoria-2", number: 2, name: "Institucional", color: "#E0951E" }
];

/** @param {string} id @param {Record<string, unknown>} layers */
const lugar = (id, layers) => ({ id, slug: id, name: id, layers });

// --- servicio --------------------------------------------------------------

test("un lugar pertenece a las capas en las que tiene texto", () => {
  const plaza = lugar("plaza", {
    "categoria-1": { text: "Plaza mayor desde 1539." },
    "categoria-2": { text: "Sede de los tres poderes." }
  });
  assert.deepEqual(categoryIdsOf(plaza).sort(), ["categoria-1", "categoria-2"]);
});

test("una capa sin texto no cuenta como registrada", () => {
  const lugarIncompleto = lugar("x", {
    "categoria-1": { text: "Algo." },
    "categoria-2": { text: "   " },
    "categoria-3": {}
  });
  assert.deepEqual(categoryIdsOf(lugarIncompleto), ["categoria-1"]);
});

test("hasContent distingue entradas vacías", () => {
  assert.equal(hasContent({ text: "sí" }), true);
  assert.equal(hasContent({ text: "" }), false);
  assert.equal(hasContent({ evidence: ["x"] }), false);
  assert.equal(hasContent(null), false);
});

test("layersOf devuelve las capas en el orden del catálogo, no del objeto", () => {
  const p = lugar("x", {
    "categoria-3": { text: "tres" },
    "categoria-1": { text: "uno" }
  });
  assert.deepEqual(
    layersOf(p, CATALOGO).map(({ category }) => category.number),
    [1, 3]
  );
});

test("un lugar puede tener las siete capas", () => {
  const siete = Array.from({ length: 7 }, (_, i) => ({
    id: `categoria-${i + 1}`,
    number: i + 1,
    name: `C${i + 1}`,
    color: "#000000"
  }));
  const layers = Object.fromEntries(siete.map((c) => [c.id, { text: `Lectura ${c.number}` }]));
  assert.equal(layersOf(lugar("todo", layers), siete).length, 7);
});

test("un lugar con varias capas aparece al filtrar por cualquiera de ellas", () => {
  const plaza = lugar("plaza", {
    "categoria-1": { text: "h" },
    "categoria-2": { text: "i" }
  });
  const museo = lugar("museo", { "categoria-1": { text: "h" } });
  const lugares = [plaza, museo];

  assert.deepEqual(filterByCategories(lugares, ["categoria-2"]).map((p) => p.id), ["plaza"]);
  assert.deepEqual(filterByCategories(lugares, ["categoria-1"]).map((p) => p.id), ["plaza", "museo"]);
  // Varias capas seleccionadas suman, y un lugar no aparece dos veces.
  assert.equal(filterByCategories(lugares, ["categoria-1", "categoria-2"]).length, 2);
});

test("un lugar con varias capas suma en el recuento de cada una", () => {
  const plaza = lugar("plaza", {
    "categoria-1": { text: "h" },
    "categoria-2": { text: "i" }
  });
  const counts = countByCategory([plaza], CATALOGO);
  assert.equal(counts["categoria-1"], 1);
  assert.equal(counts["categoria-2"], 1);
  assert.equal(counts["categoria-3"], 0);
});

test("la capa principal es la primera registrada según el catálogo", () => {
  const p = lugar("x", {
    "categoria-3": { text: "tres" },
    "categoria-2": { text: "dos" }
  });
  assert.equal(primaryCategory(p, CATALOGO).id, "categoria-2");
});

test("los documentos antiguos con categoryIds se siguen leyendo", () => {
  assert.deepEqual(categoryIdsOf({ categoryIds: ["categoria-2"] }), ["categoria-2"]);
  // Si hay layers, mandan layers.
  assert.deepEqual(
    categoryIdsOf({ categoryIds: ["categoria-2"], layers: { "categoria-1": { text: "h" } } }),
    ["categoria-1"]
  );
});

// --- datos reales ----------------------------------------------------------

const { places, categories } = embeddedPlaceRepository.parsePlacesDocument(
  globalThis.__QEA_PLACES__
);

test("el documento de datos está en el formato 3", () => {
  assert.equal(globalThis.__QEA_PLACES__.schemaVersion, 3);
});

test("todo lugar publicado registra al menos una capa", () => {
  for (const place of places.filter((p) => p.status === "published")) {
    assert.ok(layersOf(place, categories).length >= 1, `${place.id} no tiene ninguna capa`);
  }
});

test("todas las capas registradas existen en el catálogo y tienen texto", () => {
  const ids = new Set(categories.map((c) => c.id));
  for (const place of places) {
    for (const [id, entry] of Object.entries(place.layers || {})) {
      assert.ok(ids.has(id), `${place.id}: la capa «${id}» no está en el catálogo`);
      assert.ok(hasContent(entry), `${place.id}: la capa «${id}» no tiene texto`);
    }
  }
});

test("no quedan campos del modelo anterior", () => {
  for (const place of places) {
    assert.ok(!("categoryIds" in place), `${place.id} conserva categoryIds`);
    assert.ok(!("historicalContext" in place), `${place.id} conserva historicalContext suelto`);
  }
});
