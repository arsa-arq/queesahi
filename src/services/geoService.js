/**
 * Capa de servicios — geometría (sección 5.3 de ARCHITECTURE.md).
 *
 * Solo funciones puras: sin DOM, sin `navigator`, sin `localStorage`. Por eso
 * se puede probar con `node --test` sin navegador ni simuladores. Todo lo que
 * depende del dispositivo vive en `locationService.js`.
 */

/** @typedef {import("../types/place.js").GeoPoint} GeoPoint */
/** @typedef {import("../types/place.js").Place} Place */
/** @typedef {import("../types/place.js").NearestResult} NearestResult */

/** Radio medio de la Tierra, en metros (esfera IUGG). */
const EARTH_RADIUS_M = 6371008.8;

/**
 * @param {number} degrees
 * @returns {number}
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Distancia entre dos puntos por la fórmula de Haversine, en metros.
 *
 * Suficiente para escala urbana: el error frente a una elipsoide es de
 * milésimas para distancias de pocos kilómetros. Si algún día se necesita
 * precisión geodésica real, esta es la única función que cambia.
 *
 * @param {GeoPoint} a
 * @param {GeoPoint} b
 * @returns {number} Metros.
 */
export function distanceMeters(a, b) {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Formatea una distancia para mostrarla al usuario.
 * Redondea a decenas de metros para no fingir una precisión que el GPS de un
 * teléfono no tiene.
 *
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return "—";
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  const km = meters / 1000;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/**
 * Lugares ordenados de más cercano a más lejano.
 * No modifica el arreglo recibido.
 *
 * @param {GeoPoint} point
 * @param {Place[]} places
 * @returns {NearestResult[]}
 */
export function sortByDistance(point, places) {
  return places
    .map((place) => ({ place, distance: distanceMeters(point, place) }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Lugar más cercano a un punto, o `null` si no hay ninguno.
 *
 * @param {GeoPoint} point
 * @param {Place[]} places
 * @returns {NearestResult|null}
 */
export function nearest(point, places) {
  /** @type {NearestResult|null} */
  let best = null;
  for (const place of places) {
    const distance = distanceMeters(point, place);
    if (best === null || distance < best.distance) best = { place, distance };
  }
  return best;
}

/**
 * Lugares dentro de un radio, del más cercano al más lejano.
 * Base de los filtros por proximidad de la v0.4 y de las consultas PostGIS
 * de la v0.6 (sección 9 de ARCHITECTURE.md).
 *
 * @param {GeoPoint} point
 * @param {Place[]} places
 * @param {number} radiusMeters
 * @returns {NearestResult[]}
 */
export function within(point, places, radiusMeters) {
  return sortByDistance(point, places).filter((r) => r.distance <= radiusMeters);
}
