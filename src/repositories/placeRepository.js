/**
 * Capa de repositorios — contrato común (sección 5.4 de ARCHITECTURE.md).
 *
 * Toda implementación (datos embebidos hoy, IndexedDB en v0.4, Supabase en
 * v0.6) se construye con esta fábrica y solo aporta su forma de cargar los
 * datos. Así el filtro por estado editorial, la caché y la firma de los métodos
 * son idénticos en todas, y la capa de presentación nunca nota el cambio.
 *
 * Depende de: app/namespace.js, types/place.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;
  const { PUBLIC_STATUSES } = QEA.require("types");

  /** Error de la capa de datos, para distinguirlo de un fallo de la interfaz. */
  class PlaceRepositoryError extends Error {
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
   * `getById`. En la v0.1 solo lo hacía `getAll`, de modo que un lugar en
   * borrador seguía siendo accesible si algo lo pedía por su id; ahora mostrar
   * material no publicado exige pedirlo explícitamente.
   *
   * `load` devuelve el documento completo —lugares y catálogo de categorías—
   * porque ambos vienen de la misma fuente y deben cargarse a la vez: un lugar
   * que apunta a una categoría inexistente es un dato roto, y solo se puede
   * detectar teniendo los dos delante.
   *
   * @param {() => Promise<{ places: Place[], categories?: Category[] }>} load
   * @returns {PlaceRepository}
   */
  function createPlaceRepository(load) {
    /** @type {Promise<{ places: Place[], categories: Category[] }>|null} */
    let pending = null;

    /** @returns {Promise<{ places: Place[], categories: Category[] }>} */
    function documento() {
      if (!pending) {
        // Se guarda la promesa, no el resultado: dos llamadas simultáneas al
        // arrancar comparten una sola carga.
        pending = Promise.resolve()
          .then(load)
          .then((doc) => ({
            places: doc.places || [],
            categories: doc.categories || []
          }))
          .catch((error) => {
            pending = null; // un fallo no debe quedar cacheado para siempre
            throw error;
          });
      }
      return pending;
    }

    /** @returns {Promise<Place[]>} */
    async function all() {
      return (await documento()).places;
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

      async getCategories() {
        const { categories } = await documento();
        // Se ordena por número: el menú lateral debe presentarlas siempre en
        // el mismo orden, sin depender de cómo estén escritas en el archivo.
        return [...categories].sort((a, b) => a.number - b.number);
      },

      async refresh() {
        pending = null;
        return all();
      }
    };
  }

  QEA.define("placeRepository", { createPlaceRepository, PlaceRepositoryError });
})(globalThis);
