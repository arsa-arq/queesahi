/**
 * Capa de servicios — capas de lectura y filtrado (sección 5.3 de ARCHITECTURE.md).
 *
 * Funciones puras: reciben lugares y categorías, devuelven lugares. Sin DOM y
 * sin estado propio, de modo que el comportamiento del filtro se puede
 * comprobar con `node --test` sin abrir un navegador.
 *
 * Desde el ADR 0006 las siete categorías son **capas de lectura**, y un lugar
 * pertenece a una capa si y solo si tiene contenido registrado en ella
 * (`place.layers[id].text`). No hay lista de pertenencia aparte.
 *
 * Depende de: app/namespace.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;

  /**
   * ¿Tiene esta entrada de capa contenido de verdad?
   * @param {unknown} entry
   * @returns {boolean}
   */
  function hasContent(entry) {
    if (!entry || typeof entry !== "object") return false;
    const text = /** @type {any} */ (entry).text;
    return typeof text === "string" && text.trim().length > 0;
  }

  /**
   * Capas en las que un lugar tiene contenido registrado, por id.
   *
   * Lee `layers`, que es la fuente de verdad. Si el documento es anterior al
   * ADR 0006 y solo trae `categoryIds`, lo usa como respaldo para no romper
   * datos antiguos. Tolera datos a medio escribir: una ficha incompleta no debe
   * tumbar el mapa entero.
   *
   * @param {Place} place
   * @returns {string[]}
   */
  function categoryIdsOf(place) {
    const layers = /** @type {any} */ (place).layers;
    if (layers && typeof layers === "object" && !Array.isArray(layers)) {
      return Object.keys(layers).filter((id) => hasContent(layers[id]));
    }

    const legacy = /** @type {any} */ (place).categoryIds;
    if (Array.isArray(legacy)) return legacy.filter((id) => typeof id === "string" && id);
    if (typeof legacy === "string" && legacy) return [legacy];
    return [];
  }

  /**
   * Capas registradas de un lugar, ya emparejadas con su categoría y en el
   * orden del catálogo —no en el del objeto, que depende de cómo se escribió—.
   *
   * @param {Place} place
   * @param {Category[]} categories
   * @returns {{ category: Category, layer: PlaceLayer }[]}
   */
  function layersOf(place, categories) {
    const layers = /** @type {any} */ (place).layers || {};
    const ordered = [...categories].sort((a, b) => a.number - b.number);
    /** @type {{ category: Category, layer: PlaceLayer }[]} */
    const result = [];
    for (const category of ordered) {
      const entry = layers[category.id];
      if (hasContent(entry)) result.push({ category, layer: entry });
    }
    return result;
  }

  /**
   * Filtra lugares por capa.
   *
   * Un conjunto de selección vacío significa «todas», no «ninguna». Varias
   * capas seleccionadas **suman**: se muestra un lugar si tiene contenido en
   * cualquiera de ellas.
   *
   * @param {Place[]} places
   * @param {string[]} selectedIds
   * @returns {Place[]}
   */
  function filterByCategories(places, selectedIds) {
    if (!selectedIds || selectedIds.length === 0) return [...places];
    const selected = new Set(selectedIds);
    return places.filter((place) => categoryIdsOf(place).some((id) => selected.has(id)));
  }

  /**
   * Cuántos lugares tienen contenido en cada capa, por id.
   *
   * Con capas múltiples un mismo lugar suma en varias, así que la suma de los
   * recuentos puede superar el número de lugares. Es lo correcto: el número
   * dice cuántos lugares se han leído desde esa capa.
   *
   * @param {Place[]} places
   * @param {Category[]} categories
   * @returns {Record<string, number>}
   */
  function countByCategory(places, categories) {
    /** @type {Record<string, number>} */
    const counts = {};
    for (const category of categories) counts[category.id] = 0;
    for (const place of places) {
      for (const id of categoryIdsOf(place)) {
        if (id in counts) counts[id] += 1;
      }
    }
    return counts;
  }

  /**
   * Busca una categoría por su id.
   * @param {Category[]} categories
   * @param {string} id
   * @returns {Category|null}
   */
  function findCategory(categories, id) {
    return categories.find((category) => category.id === id) || null;
  }

  /**
   * Primera capa registrada del lugar, en orden de catálogo. Da el color del
   * encabezado de la ficha cuando no hay fotografía.
   *
   * @param {Place} place
   * @param {Category[]} categories
   * @returns {Category|null}
   */
  function primaryCategory(place, categories) {
    const ordered = [...categories].sort((a, b) => a.number - b.number);
    const ids = new Set(categoryIdsOf(place));
    return ordered.find((category) => ids.has(category.id)) || null;
  }

  /**
   * Lugares sin ninguna capa conocida registrada: quedarían invisibles en
   * cuanto alguien filtre por algo.
   *
   * @param {Place[]} places
   * @param {Category[]} categories
   * @returns {Place[]}
   */
  function uncategorized(places, categories) {
    const known = new Set(categories.map((category) => category.id));
    return places.filter((place) => !categoryIdsOf(place).some((id) => known.has(id)));
  }

  QEA.define("categoryService", {
    hasContent,
    categoryIdsOf,
    layersOf,
    filterByCategories,
    countByCategory,
    findCategory,
    primaryCategory,
    uncategorized
  });
})(globalThis);
