/**
 * Capa de repositorios — implementación sobre JSON estático.
 *
 * Corresponde a la versión 0.1/0.2 de la sección 7 de ARCHITECTURE.md: los
 * datos viven en `public/data/places.json`, sin backend. La v0.3 añadirá
 * `indexedDbPlaceRepository.js` y la v0.6 `supabasePlaceRepository.js`, ambos
 * con esta misma interfaz.
 */

import { createPlaceRepository, PlaceRepositoryError } from "./placeRepository.js";
import { PLACES_URL } from "../app/config.js";

/** @typedef {import("../types/place.js").Place} Place */
/** @typedef {import("../types/place.js").PlaceRepository} PlaceRepository */

/** Versión del formato de `places.json` que este código sabe leer. */
export const SUPPORTED_SCHEMA_VERSION = 1;

/**
 * Normaliza el documento cargado.
 *
 * Acepta tanto `{ schemaVersion, places: [...] }` como un arreglo suelto, para
 * que un cambio de formato no rompa las herramientas que ya leen el archivo.
 *
 * @param {unknown} document
 * @returns {Place[]}
 */
export function parsePlacesDocument(document) {
  if (Array.isArray(document)) return /** @type {Place[]} */ (document);

  if (document && typeof document === "object") {
    const doc = /** @type {Record<string, unknown>} */ (document);
    if (Array.isArray(doc.places)) {
      const version = doc.schemaVersion;
      if (typeof version === "number" && version > SUPPORTED_SCHEMA_VERSION) {
        throw new PlaceRepositoryError(
          `places.json usa el formato ${version} y esta versión de la aplicación entiende hasta el ${SUPPORTED_SCHEMA_VERSION}.`
        );
      }
      return /** @type {Place[]} */ (doc.places);
    }
  }

  throw new PlaceRepositoryError("places.json no tiene el formato esperado.");
}

/**
 * Repositorio que lee los lugares por HTTP.
 *
 * @param {string} [url]
 * @param {typeof fetch} [fetchImpl] Inyectable para las pruebas.
 * @returns {PlaceRepository}
 */
export function createJsonPlaceRepository(url = PLACES_URL, fetchImpl = globalThis.fetch) {
  return createPlaceRepository(async () => {
    let response;
    try {
      response = await fetchImpl(url, { headers: { Accept: "application/json" } });
    } catch (error) {
      // Caso típico: abrir index.html con doble clic (protocolo file://),
      // donde el navegador bloquea la petición por CORS.
      throw new PlaceRepositoryError(
        "No se pudo leer la lista de lugares. Sirve el proyecto por HTTP (npm start).",
        { cause: error }
      );
    }

    if (!response.ok) {
      throw new PlaceRepositoryError(`No se pudo leer ${url} (HTTP ${response.status}).`);
    }

    let document;
    try {
      document = await response.json();
    } catch (error) {
      throw new PlaceRepositoryError("places.json no es JSON válido.", { cause: error });
    }

    return parsePlacesDocument(document);
  });
}
