/**
 * Capa de servicios — ubicación del dispositivo (sección 5.3 de ARCHITECTURE.md).
 *
 * Aísla las dos APIs del navegador que el resto del código no debería tocar:
 * `navigator.geolocation` y `localStorage`. Está separado de `geoService.js`
 * para que la geometría siga siendo pura y comprobable fuera del navegador.
 *
 * Guardar la última posición conocida es el primer gesto local-first del
 * proyecto (sección 6): si el GPS falla, la aplicación todavía puede responder.
 *
 * Depende de: app/namespace.js, app/config.js
 */

/**
 * Motivo por el que no se pudo obtener la ubicación. Se traduce a un mensaje
 * en la capa de presentación, no aquí.
 * @typedef {"unsupported"|"denied"|"unavailable"|"timeout"|"unknown"} LocationErrorCode
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;
  const { GEOLOCATION_OPTIONS, STORAGE_KEYS } = QEA.require("config");

  /** Error de ubicación con un código estable, independiente del navegador. */
  class LocationError extends Error {
    /**
     * @param {LocationErrorCode} code
     * @param {string} message
     */
    constructor(code, message) {
      super(message);
      this.name = "LocationError";
      /** @type {LocationErrorCode} */
      this.code = code;
    }
  }

  /**
   * Traduce el `GeolocationPositionError` del navegador a un código propio.
   * @param {{ code?: number }} error
   * @returns {LocationErrorCode}
   */
  function toErrorCode(error) {
    switch (error && error.code) {
      case 1:
        return "denied";
      case 2:
        return "unavailable";
      case 3:
        return "timeout";
      default:
        return "unknown";
    }
  }

  /**
   * Lee `localStorage` sin romperse en modo privado, con cookies bloqueadas o
   * bajo file://, donde algunos navegadores lo deshabilitan.
   * @param {string} key
   * @returns {unknown}
   */
  function readStorage(key) {
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Escribe en `localStorage` ignorando fallos: perder la caché nunca debe
   * impedir que la aplicación siga funcionando.
   * @param {string} key
   * @param {unknown} value
   */
  function writeStorage(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* almacenamiento no disponible: se continúa sin caché */
    }
  }

  /**
   * Posición actual del usuario. Guarda la última conocida al tener éxito.
   * @returns {Promise<GeoPoint>}
   */
  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!global.navigator || !("geolocation" in global.navigator)) {
        reject(new LocationError("unsupported", "Este dispositivo no permite geolocalización."));
        return;
      }
      global.navigator.geolocation.getCurrentPosition(
        (/** @type {any} */ position) => {
          /** @type {GeoPoint} */
          const point = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          writeStorage(STORAGE_KEYS.lastPosition, { ...point, at: Date.now() });
          resolve(point);
        },
        (/** @type {any} */ error) => {
          reject(new LocationError(toErrorCode(error), error.message || "Ubicación no disponible."));
        },
        GEOLOCATION_OPTIONS
      );
    });
  }

  /**
   * Última posición guardada, o `null`. Valida la forma del dato: una entrada
   * corrupta en `localStorage` no debe llegar a los cálculos de distancia.
   * @returns {(GeoPoint & { at?: number })|null}
   */
  function getLastKnownPosition() {
    const value = readStorage(STORAGE_KEYS.lastPosition);
    if (!value || typeof value !== "object") return null;
    const point = /** @type {Record<string, unknown>} */ (value);
    if (typeof point.latitude !== "number" || typeof point.longitude !== "number") return null;
    if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return null;
    return /** @type {any} */ (value);
  }

  /** Olvida la última posición conocida (privacidad: útil desde la interfaz). */
  function forgetLastKnownPosition() {
    try {
      global.localStorage.removeItem(STORAGE_KEYS.lastPosition);
    } catch {
      /* nada que hacer */
    }
  }

  QEA.define("locationService", {
    LocationError,
    getCurrentPosition,
    getLastKnownPosition,
    forgetLastKnownPosition
  });
})(globalThis);
