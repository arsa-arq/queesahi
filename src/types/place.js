/**
 * Modelo de datos del proyecto.
 *
 * Corresponde a la sección 8 de ARCHITECTURE.md («Modelo de datos inicial»).
 * Se declara con JSDoc en lugar de TypeScript para que la aplicación siga
 * ejecutándose sin build; `npm run typecheck` valida estos tipos con `tsc`
 * gracias a `jsconfig.json` (checkJs).
 *
 * Depende de: app/namespace.js
 */

/**
 * Estados editoriales de un lugar (sección 8 de ARCHITECTURE.md).
 * @typedef {"draft"|"review"|"approved"|"published"|"archived"} PlaceStatus
 */

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
 * @property {string} [historicalContext]  Obsoleto: su contenido vive ahora en
 *   la capa Histórica, `layers["categoria-1"]`.
 * @property {string} [curiosity]          Dato curioso.
 * @property {number}   latitude           Grados decimales (WGS 84).
 * @property {number}   longitude          Grados decimales (WGS 84).
 * @property {string}   location           Dirección o referencia urbana.
 * @property {Record<string, PlaceLayer>} [layers] Lo registrado desde cada
 *   capa de lectura, por id de categoría. Un lugar pertenece a una capa si y
 *   solo si tiene contenido en ella; puede tener una, varias o las siete
 *   (ADR 0006).
 * @property {string[]} [categoryIds]      Obsoleto desde el ADR 0006. Solo se
 *   lee como respaldo de documentos antiguos.
 * @property {string[]} tags               Etiquetas editoriales libres que se
 *   muestran como fichas en la ficha. No confundir con `categoryIds`.
 * @property {string[]} images             Rutas o URLs de imágenes.
 * @property {string[]} sources            Fuentes consultadas.
 * @property {PlaceStatus} status          Estado editorial.
 * @property {string}   createdAt          Fecha ISO (YYYY-MM-DD).
 * @property {string}   updatedAt          Fecha ISO (YYYY-MM-DD).
 * @property {string} [emoji]              Presentación: icono del marcador.
 */

/**
 * Una de las siete categorías en que se clasifican los predios.
 *
 * El catálogo vive en el documento de datos, no repartido por los lugares, para
 * que exista una sola definición de qué categorías hay, en qué orden y de qué
 * color. El color es lo que hace legible el mapa al filtrar.
 *
 * Los campos `layer`, `axis`, `question`, `studies` y `evidence` vienen de la
 * matriz de la Cátedra (`docs/product/matriz-de-categorias.md`). No se muestran
 * todos: guían al equipo editorial sobre qué debe contener la ficha de un
 * predio leído desde esta capa.
 *
 * @typedef {Object} Category
 * @property {string} id        Identificador estable, `categoria-1` … `categoria-7`.
 * @property {number} number    Orden de presentación, 1 a 7.
 * @property {string} name      Nombre visible.
 * @property {string} color     Acento `#RRGGBB`, aplicado al marcador y a la ficha.
 * @property {string} [layer]   Capa de ciudad. Subtítulo en el menú lateral.
 * @property {string} [axis]    Eje de Cátedra Bogotá al que responde.
 * @property {string} [question] Pregunta orientadora para leer un predio.
 * @property {string} [studies] Qué estudia esta capa.
 * @property {string} [evidence] Evidencia o producto esperado.
 */

/**
 * Lo registrado sobre un lugar desde una capa de lectura.
 *
 * `text` responde a la pregunta orientadora de la capa. `evidence` y `sources`
 * son opcionales: las fuentes generales del lugar siguen en `Place.sources`, y
 * estas son las que sostienen específicamente esta lectura.
 *
 * @typedef {Object} PlaceLayer
 * @property {string}   text        Respuesta a la pregunta orientadora.
 * @property {string[]} [evidence]  Evidencias o productos que la sostienen.
 * @property {string[]} [sources]   Fuentes específicas de esta capa.
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
 * Cualquier implementación —datos embebidos, IndexedDB, Supabase— debe cumplir
 * esta interfaz para que la capa de presentación no cambie.
 *
 * @typedef {Object} PlaceRepository
 * @property {(options?: QueryOptions) => Promise<Place[]>} getAll
 * @property {(id: string, options?: QueryOptions) => Promise<Place|null>} getById
 * @property {(slug: string, options?: QueryOptions) => Promise<Place|null>} getBySlug
 * @property {() => Promise<Category[]>} getCategories El catálogo de siete.
 * @property {() => Promise<Place[]>} refresh Vacía la caché y vuelve a cargar.
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;

  /** Todos los estados editoriales válidos, en orden de maduración. */
  const PLACE_STATUSES = /** @type {PlaceStatus[]} */ ([
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
  const PUBLIC_STATUSES = /** @type {PlaceStatus[]} */ (["published"]);

  QEA.define("types", { PLACE_STATUSES, PUBLIC_STATUSES });
})(globalThis);
