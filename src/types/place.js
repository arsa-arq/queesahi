/**
 * Modelo de datos del proyecto.
 *
 * Corresponde a la sección 8 de ARCHITECTURE.md («Modelo de datos inicial»).
 * Se declara con JSDoc en lugar de TypeScript para que la aplicación siga
 * ejecutándose sin build; `npm run typecheck` valida estos tipos con `tsc`
 * gracias a `jsconfig.json` (checkJs). Al migrar a TypeScript (ver
 * docs/adr/0002), este archivo se convierte en `place.ts` casi tal cual.
 */

/**
 * Estados editoriales de un lugar (sección 8 de ARCHITECTURE.md).
 * @typedef {"draft"|"review"|"approved"|"published"|"archived"} PlaceStatus
 */

/** Todos los estados editoriales válidos, en orden de maduración. */
export const PLACE_STATUSES = /** @type {PlaceStatus[]} */ ([
  "draft",
  "review",
  "approved",
  "published",
  "archived"
]);

/**
 * Estados que la aplicación pública muestra a cualquier visitante.
 * Todo lo demás es material editorial en preparación y no debe salir a la web.
 */
export const PUBLIC_STATUSES = /** @type {PlaceStatus[]} */ (["published"]);

/**
 * Un punto de interés.
 *
 * `emoji` y `color` no están en el modelo de la sección 8: son metadatos de
 * presentación que esta versión usa para el marcador y el encabezado de la
 * ficha. Se mantienen opcionales para no contaminar el modelo de dominio.
 *
 * @typedef {Object} Place
 * @property {string}   id                 Identificador estable (kebab-case).
 * @property {string}   slug               Identificador para URLs (kebab-case).
 * @property {string}   name               Nombre visible.
 * @property {string}   summary            Frase corta de presentación.
 * @property {string}   description        Descripción principal.
 * @property {string} [whyItMatters]       Por qué importa.
 * @property {string} [lookCloser]         Qué mirar de cerca al estar allí.
 * @property {string} [historicalContext]  Contexto histórico.
 * @property {string} [curiosity]          Dato curioso.
 * @property {number}   latitude           Grados decimales (WGS 84).
 * @property {number}   longitude          Grados decimales (WGS 84).
 * @property {string}   location           Dirección o referencia urbana.
 * @property {string[]} categories         Etiquetas temáticas.
 * @property {string[]} images             Rutas o URLs de imágenes.
 * @property {string[]} sources            Fuentes consultadas.
 * @property {PlaceStatus} status          Estado editorial.
 * @property {string}   createdAt          Fecha ISO (YYYY-MM-DD).
 * @property {string}   updatedAt          Fecha ISO (YYYY-MM-DD).
 * @property {string} [emoji]              Presentación: icono del marcador.
 * @property {string} [color]              Presentación: acento `#RRGGBB`.
 */

/**
 * Punto geográfico. `accuracy` viene de la API de geolocalización, en metros.
 * @typedef {Object} GeoPoint
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [accuracy]
 */

/**
 * Resultado de una búsqueda por proximidad.
 * @typedef {Object} NearestResult
 * @property {Place}  place
 * @property {number} distance Metros.
 */

/**
 * Opciones comunes de consulta al repositorio.
 * @typedef {Object} QueryOptions
 * @property {PlaceStatus[]} [statuses] Estados aceptados. Por defecto,
 *   únicamente `published`.
 */

/**
 * Contrato de acceso a datos (sección 5.4 de ARCHITECTURE.md).
 *
 * Cualquier implementación —JSON, IndexedDB, Supabase— debe cumplir esta
 * interfaz para que la capa de presentación no cambie.
 *
 * @typedef {Object} PlaceRepository
 * @property {(options?: QueryOptions) => Promise<Place[]>} getAll
 * @property {(id: string, options?: QueryOptions) => Promise<Place|null>} getById
 * @property {(slug: string, options?: QueryOptions) => Promise<Place|null>} getBySlug
 * @property {() => Promise<Place[]>} refresh Vacía la caché y vuelve a cargar.
 */

export {};
