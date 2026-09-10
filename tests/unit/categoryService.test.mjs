/**
 * Filtrado por las siete categorías.
 *
 * La regla que más importa es que «nada seleccionado» signifique «todas»: es lo
 * que espera quien abre el menú y no toca nada, y lo contrario dejaría el mapa
 * en blanco al arrancar.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { categoryService } from "../helpers/loadApp.mjs";

const {
  categoryIdsOf,
  filterByCategories,
  countByCategory,
  findCategory,
  primaryCategory,
  uncategorized
} = categoryService;

const CATEGORIAS = [
  { id: "categoria-1", number: 1, name: "Categoría 1", color: "#C74A2C" },
  { id: "categoria-2", number: 2, name: "Categoría 2", color: "#E0951E" },
  { id: "categoria-7", number: 7, name: "Categoría 7", color: "#6F4A7F" }
];

/** @param {string} id @param {string[]} categoryIds */
const lugar = (id, categoryIds) => ({ id, slug: id, name: id, categoryIds });

const LUGARES = [
  lugar("uno", ["categoria-1"]),
  lugar("dos", ["categoria-2"]),
  lugar("tres", ["categoria-1"]),
  lugar("cuatro", ["categoria-1", "categoria-2"])
];

test("sin selección se muestran todos", () => {
  assert.equal(filterByCategories(LUGARES, []).length, 4);
  assert.equal(filterByCategories(LUGARES, undefined).length, 4);
});

test("filtrar por una categoría", () => {
  assert.deepEqual(
    filterByCategories(LUGARES, ["categoria-1"]).map((p) => p.id),
    ["uno", "tres", "cuatro"]
  );
});

test("filtrar por varias categorías las suma, no las cruza", () => {
  // Marcar dos categorías debe mostrar los lugares de ambas. Cruzarlas
  // dejaría solo los que están en las dos, que no es lo que sugiere un menú
  // de casillas.
  assert.equal(filterByCategories(LUGARES, ["categoria-1", "categoria-2"]).length, 4);
});

test("una categoría vacía deja el resultado vacío", () => {
  assert.deepEqual(filterByCategories(LUGARES, ["categoria-7"]), []);
});

test("filtrar no modifica el arreglo original", () => {
  const original = [...LUGARES];
  filterByCategories(LUGARES, ["categoria-1"]);
  assert.deepEqual(LUGARES, original);
});

test("countByCategory cuenta cada categoría, incluidas las vacías", () => {
  const counts = countByCategory(LUGARES, CATEGORIAS);
  assert.equal(counts["categoria-1"], 3);
  assert.equal(counts["categoria-2"], 2);
  assert.equal(counts["categoria-7"], 0, "una categoría sin lugares cuenta cero, no falta");
});

test("categoryIdsOf tolera datos a medio escribir", () => {
  assert.deepEqual(categoryIdsOf({ categoryIds: ["categoria-1"] }), ["categoria-1"]);
  assert.deepEqual(categoryIdsOf({ categoryIds: "categoria-1" }), ["categoria-1"]);
  assert.deepEqual(categoryIdsOf({}), []);
  assert.deepEqual(categoryIdsOf({ categoryIds: [null, "", "categoria-2"] }), ["categoria-2"]);
});

test("findCategory y primaryCategory", () => {
  assert.equal(findCategory(CATEGORIAS, "categoria-2").number, 2);
  assert.equal(findCategory(CATEGORIAS, "no-existe"), null);
  assert.equal(primaryCategory(lugar("x", ["categoria-2"]), CATEGORIAS).id, "categoria-2");
  assert.equal(primaryCategory(lugar("x", ["fantasma"]), CATEGORIAS), null);
});

test("primaryCategory salta las categorías que no existen", () => {
  const place = lugar("x", ["fantasma", "categoria-2"]);
  assert.equal(primaryCategory(place, CATEGORIAS).id, "categoria-2");
});

test("uncategorized encuentra los predios que quedarían invisibles al filtrar", () => {
  const conHuerfano = [...LUGARES, lugar("huerfano", ["categoria-inexistente"])];
  assert.deepEqual(
    uncategorized(conHuerfano, CATEGORIAS).map((p) => p.id),
    ["huerfano"]
  );
  assert.deepEqual(uncategorized(LUGARES, CATEGORIAS), []);
});
