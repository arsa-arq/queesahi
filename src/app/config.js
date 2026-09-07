/**
 * Configuración de la aplicación.
 *
 * Un único lugar para las constantes que cambian entre versiones o entornos.
 * Cuando el proyecto migre a Vite, estos valores pasan a `import.meta.env`
 * sin tocar el resto del código.
 */

/**
 * Origen de datos de la capa de persistencia.
 *
 * Hoy es un JSON estático servido junto a la página. Tras la migración a Vite,
 * `public/` se publica en la raíz del sitio y esta ruta pasa a `/data/places.json`:
 * es la única línea que hay que cambiar.
 */
export const PLACES_URL = "./public/data/places.json";

/** Centro del mapa al abrir, sobre el centro histórico. */
export const MAP_CENTER = /** @type {[number, number]} */ ([4.5985, -74.072]);

/** Zoom inicial y máximo permitido por el proveedor de teselas. */
export const MAP_ZOOM = { initial: 16, max: 19, focus: 17 };

/** Teselas de OpenStreetMap y su atribución obligatoria. */
export const TILE_LAYER = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
};

/**
 * A partir de esta distancia se avisa al usuario de que el lugar más cercano
 * queda lejos. El centro histórico cabe holgadamente en 3 km.
 */
export const FAR_AWAY_METERS = 3000;

/** Opciones de la API de geolocalización del navegador. */
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000
};

/** Claves de `localStorage`. El prefijo evita colisiones en el mismo origen. */
export const STORAGE_KEYS = {
  lastPosition: "qea:lastPosition"
};

/** Color de acento por defecto cuando un lugar no declara uno válido. */
export const DEFAULT_ACCENT = "#04437F";

/** Prefijo de los enlaces profundos: `#/lugar/<slug>`. */
export const PLACE_ROUTE_PREFIX = "#/lugar/";
