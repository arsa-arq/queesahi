/**
 * Capa de repositorios — contrato común (sección 5.4 de ARCHITECTURE.md).
 *
 * Toda implementación (JSON hoy, IndexedDB en v0.3, Supabase en v0.6) se
 * construye con esta fábrica y solo aporta su forma de cargar los datos. Así
 * el filtro por estado editorial, la caché y la firma de los métodos son
 * idénticos en las tres, y la capa de presentación nunca nota el cambio.
 */

import { PUBLIC_STATUSES } from "../types/place.js";

/** @typedef {import("../types/place.js").Place} Place */
/** @typedef {import("../types/place.js").PlaceStatus} PlaceStatus */
/** @typedef {import("../types/place.js").QueryOptions} QueryOptions */
/** @typedef {import("../types/place.js").PlaceRepository} PlaceRepository */

/** Error de la capa de datos, para distinguirlo de un fallo de la interfaz. */
export class PlaceRepositoryError extends Error {
  /**
   * @param {string} message
   * @param {{ cause?: unknown }} [options]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = "PlaceRepositoryError";
    this.cause = options.cause;
  }
}

/**
 * Construye un repositorio a partir de una función de carga.
 *
 * El filtro por `status` se aplica en **todos** los métodos, incluido
 * `getById`. En la versión anterior solo lo hacía `getAll`, de modo que un
 * lugar en borrador seguía siendo accesible si algo lo pedía por su id; ahora
 * mostrar material no publicado exige pedirlo explícitamente.
 *
 * @param {() => Promise<Place[]>} loadPlaces
 * @returns {PlaceRepository}
 */
export function createPlaceRepository(loadPlaces) {
  /** @type {Promise<Place[]>|null} */
  let pending = null;

  /** @returns {Promise<Place[]>} */
  function all() {
    if (!pending) {
      // Se guarda la promesa, no el resultado: dos llamadas simultáneas al
      // arrancar comparten una sola carga.
      pending = Promise.resolve()
        .then(loadPlaces)
        .catch((error) => {
          pending = null; // un fallo no debe quedar cacheado para siempre
          throw error;
        });
    }
    return pending;
  }

  /**
   * @param {Place} place
   * @param {QueryOptions} [options]
   * @returns {boolean}
   */
  function isVisible(place, options) {
    const statuses = (options && options.statuses) || PUBLIC_STATUSES;
    return statuses.includes(place.status);
  }

  return {
    async getAll(options) {
      const places = await all();
      return places.filter((place) => isVisible(place, options));
    },

    async getById(id, options) {
      const places = await all();
      return places.find((place) => place.id === id && isVisible(place, options)) || null;
    },

    async getBySlug(slug, options) {
      const places = await all();
      return places.find((place) => place.slug === slug && isVisible(place, options)) || null;
    },

    async refresh() {
      pending = null;
      return all();
    }
  };
}
