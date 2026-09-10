/**
 * Capa de repositorios — datos embebidos en la página.
 *
 * Lee el objeto que `public/data/places.js` deja en `globalThis`. Es la
 * implementación que permite abrir `index.html` con doble clic: no hay red, no
 * hay `fetch`, no hay nada que el navegador pueda bloquear.
 *
 * Cuando el proyecto tenga servidor propio (v0.4 en adelante), aquí se suman
 * `indexedDbPlaceRepository.js` y `supabasePlaceRepository.js`, con esta misma
 * interfaz y sin tocar la presentación.
 *
 * Depende de: app/namespace.js, types/place.js, repositories/placeRepository.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;
  const { createPlaceRepository, PlaceRepositoryError } = QEA.require("placeRepository");

  /** Versión del formato de datos que este código sabe leer. */
  const SUPPORTED_SCHEMA_VERSION = 2;

  /** Nombre de la variable global que deja `public/data/places.js`. */
  const GLOBAL_KEY = "__QEA_PLACES__";

  /**
   * Normaliza y valida el documento de datos.
   *
   * Acepta tanto `{ schemaVersion, places, categories }` como un arreglo suelto
   * de lugares, para que un cambio de formato no rompa las herramientas que ya
   * lo leen. El formato 1 no tenía catálogo de categorías; se devuelve vacío.
   *
   * @param {unknown} document
   * @returns {{ places: Place[], categories: Category[] }}
   */
  function parsePlacesDocument(document) {
    if (Array.isArray(document)) {
      return { places: /** @type {Place[]} */ (document), categories: [] };
    }

    if (document && typeof document === "object") {
      const doc = /** @type {Record<string, unknown>} */ (document);
      if (Array.isArray(doc.places)) {
        const version = doc.schemaVersion;
        if (typeof version === "number" && version > SUPPORTED_SCHEMA_VERSION) {
          throw new PlaceRepositoryError(
            `Los datos usan el formato ${version} y esta versión de la aplicación entiende hasta el ${SUPPORTED_SCHEMA_VERSION}.`
          );
        }
        return {
          places: /** @type {Place[]} */ (doc.places),
          categories: Array.isArray(doc.categories)
            ? /** @type {Category[]} */ (doc.categories)
            : []
        };
      }
    }

    throw new PlaceRepositoryError("public/data/places.js no tiene el formato esperado.");
  }

  /**
   * Repositorio sobre los datos embebidos.
   *
   * @param {unknown} [source] Documento a usar. Por defecto, el global.
   * @returns {PlaceRepository}
   */
  function createEmbeddedPlaceRepository(source) {
    return createPlaceRepository(async () => {
      const document = source === undefined ? global[GLOBAL_KEY] : source;
      if (document === undefined) {
        throw new PlaceRepositoryError(
          "No se cargaron los datos. Revisa que index.html incluya public/data/places.js."
        );
      }
      return parsePlacesDocument(document);
    });
  }

  QEA.define("embeddedPlaceRepository", {
    createEmbeddedPlaceRepository,
    parsePlacesDocument,
    SUPPORTED_SCHEMA_VERSION,
    GLOBAL_KEY
  });
})(globalThis);
