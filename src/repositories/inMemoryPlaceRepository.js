/**
 * Capa de repositorios — implementación en memoria.
 *
 * Sirve para las pruebas y para cualquier prototipo que necesite datos fijos.
 * Comparte fábrica con `embeddedPlaceRepository`, así que lo que se verifica
 * aquí (filtro por estado, caché, búsqueda por id y por slug) vale igual para
 * las implementaciones reales.
 *
 * Depende de: app/namespace.js, repositories/placeRepository.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;
  const { createPlaceRepository } = QEA.require("placeRepository");

  /**
   * @param {Place[]} places
   * @param {Category[]} [categories]
   * @returns {PlaceRepository}
   */
  function createInMemoryPlaceRepository(places, categories = []) {
    // Copia defensiva: quien construya el repositorio no debería poder mutar
    // sus datos después.
    const snapshot = places.map((place) => ({ ...place }));
    const catalogo = categories.map((category) => ({ ...category }));
    return createPlaceRepository(async () => ({ places: snapshot, categories: catalogo }));
  }

  QEA.define("inMemoryPlaceRepository", { createInMemoryPlaceRepository });
})(globalThis);
