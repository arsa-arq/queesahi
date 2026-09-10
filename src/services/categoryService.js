/**
 * Capa de servicios — categorías y filtrado (sección 5.3 de ARCHITECTURE.md).
 *
 * Funciones puras: reciben lugares y categorías, devuelven lugares. Sin DOM y
 * sin estado propio, de modo que el comportamiento del filtro se puede
 * comprobar con `node --test` sin abrir un navegador. Quién está seleccionado
 * en cada momento lo guarda la interfaz, no este módulo.
 *
 * Depende de: app/namespace.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;

  /**
   * Categorías a las que pertenece un lugar.
   *
   * Tolera que falte el campo o que venga como texto suelto en vez de arreglo:
   * los datos los edita el equipo editorial a mano, y una ficha a medio escribir
   * no debe tumbar el mapa entero.
   *
   * @param {Place} place
   * @returns {string[]}
   */
  function categoryIdsOf(place) {
    const value = /** @type {any} */ (place).categoryIds;
    if (Array.isArray(value)) return value.filter((id) => typeof id === "string" && id);
    if (typeof value === "string" && value) return [value];
    return [];
  }

  /**
   * Filtra lugares por categoría.
   *
   * Un conjunto de selección vacío significa «todas», no «ninguna». Es la
   * lectura que espera cualquiera que abra el menú y no toque nada, y evita
   * que la aplicación arranque con el mapa en blanco.
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
   * Cuántos lugares hay en cada categoría, por id.
   *
   * El menú lo usa para mostrar el número junto a cada nombre y para atenuar
   * las que están vacías: pulsar un filtro que deja el mapa sin nada es una
   * frustración fácil de evitar.
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
   * Categoría principal de un lugar: la primera que declara. Determina el color
   * del marcador y el del encabezado de su ficha.
   *
   * @param {Place} place
   * @param {Category[]} categories
   * @returns {Category|null}
   */
  function primaryCategory(place, categories) {
    for (const id of categoryIdsOf(place)) {
      const category = findCategory(categories, id);
      if (category) return category;
    }
    return null;
  }

  /**
   * Lugares que no pertenecen a ninguna categoría conocida.
   *
   * Con el catálogo cerrado en siete, un predio fuera de todas ellas es un
   * error de datos: quedaría invisible en cuanto alguien filtre por algo.
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
    categoryIdsOf,
    filterByCategories,
    countByCategory,
    findCategory,
    primaryCategory,
    uncategorized
  });
})(globalThis);
