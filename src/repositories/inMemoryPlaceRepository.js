/**
 * Capa de repositorios — implementación en memoria.
 *
 * Sirve para las pruebas y para cualquier prototipo que necesite datos fijos
 * sin red. Comparte fábrica con `jsonPlaceRepository`, así que lo que se
 * verifica aquí (filtro por estado, caché, búsqueda por id y por slug) vale
 * igual para las implementaciones reales.
 */

import { createPlaceRepository } from "./placeRepository.js";

/** @typedef {import("../types/place.js").Place} Place */
/** @typedef {import("../types/place.js").PlaceRepository} PlaceRepository */

/**
 * @param {Place[]} places
 * @returns {PlaceRepository}
 */
export function createInMemoryPlaceRepository(places) {
  // Copia defensiva: quien construya el repositorio no debería poder mutar
  // sus datos después.
  const snapshot = places.map((place) => ({ ...place }));
  return createPlaceRepository(async () => snapshot);
}
