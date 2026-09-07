/**
 * Configuración de la aplicación.
 *
 * Un único lugar para las constantes que cambian entre versiones o entornos.
 *
 * Depende de: app/namespace.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;

  QEA.define("config", {
    /** Centro del mapa al abrir, sobre el centro histórico. */
    MAP_CENTER: /** @type {[number, number]} */ ([4.5985, -74.072]),

    /** Zoom inicial, máximo del proveedor de teselas y al enfocar un lugar. */
    MAP_ZOOM: { initial: 16, max: 19, focus: 17 },

    /** Teselas de OpenStreetMap y su atribución obligatoria. */
    TILE_LAYER: {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },

    /**
     * A partir de esta distancia se avisa de que el lugar más cercano queda
     * lejos. El centro histórico cabe holgadamente en 3 km.
     */
    FAR_AWAY_METERS: 3000,

    /** Opciones de la API de geolocalización del navegador. */
    GEOLOCATION_OPTIONS: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    },

    /** Claves de `localStorage`. El prefijo evita colisiones en el mismo origen. */
    STORAGE_KEYS: {
      lastPosition: "qea:lastPosition"
    },

    /** Color de acento por defecto cuando un lugar no declara uno válido. */
    DEFAULT_ACCENT: "#04437F",

    /** Prefijo de los enlaces profundos: `#/lugar/<slug>`. */
    PLACE_ROUTE_PREFIX: "#/lugar/"
  });
})(globalThis);
