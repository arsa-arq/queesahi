/**
 * Construcción segura de HTML.
 *
 * La ficha de cada lugar se arma con `innerHTML`. Mientras los datos los
 * escriba solo el equipo, eso es inofensivo; pero el roadmap los mueve a
 * IndexedDB (v0.4), a Supabase (v0.6) y a un panel de edición con usuarios
 * (v0.7). A partir de ahí, texto escrito por otra persona termina inyectado en
 * el DOM: sin escapar, es XSS almacenado.
 *
 * Regla del proyecto: nada que venga de datos entra al DOM sin pasar por aquí.
 * Ver docs/adr/0003-escapado-html-en-las-fichas.md
 *
 * Depende de: app/namespace.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;

  /** @type {Record<string, string>} */
  const ENTITIES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  /** Marca interna para fragmentos ya escapados. */
  const SAFE = "__qeaSafeHtml__";

  /**
   * Escapa los cinco caracteres con significado en HTML.
   * @param {unknown} value
   * @returns {string}
   */
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
  }

  /**
   * Marca una cadena como HTML ya seguro. Úsalo solo con fragmentos construidos
   * por el propio código, nunca con datos de entrada.
   * @param {string} value
   * @returns {{ __qeaSafeHtml__: true, value: string }}
   */
  function raw(value) {
    return { [SAFE]: true, value: String(value) };
  }

  /**
   * Convierte cualquier valor interpolado en HTML seguro.
   * - `null`, `undefined` y los booleanos desaparecen (permiten condicionales).
   * - Los arreglos se concatenan.
   * - Los fragmentos marcados con `raw()` o creados por `html` pasan intactos.
   * - Todo lo demás se escapa.
   * @param {unknown} value
   * @returns {string}
   */
  function render(value) {
    if (value === null || value === undefined || typeof value === "boolean") return "";
    if (Array.isArray(value)) return value.map(render).join("");
    if (typeof value === "object" && /** @type {any} */ (value)[SAFE]) {
      return /** @type {any} */ (value).value;
    }
    return escapeHtml(value);
  }

  /**
   * Plantilla etiquetada que escapa todas las interpolaciones.
   *
   *   html`<h2>${place.name}</h2>`        // place.name queda escapado
   *   html`<div>${html`<b>ok</b>`}</div>` // los fragmentos anidados se respetan
   *
   * @param {TemplateStringsArray} strings
   * @param {...unknown} values
   */
  function html(strings, ...values) {
    let out = strings[0];
    for (let i = 0; i < values.length; i += 1) {
      out += render(values[i]) + strings[i + 1];
    }
    return raw(out);
  }

  /**
   * Serializa el resultado de `html` para asignarlo a `innerHTML`.
   * @param {unknown} value
   * @returns {string}
   */
  function toHtmlString(value) {
    return render(value);
  }

  /**
   * Devuelve la URL si su esquema es seguro para un enlace; si no, cadena vacía.
   * Bloquea `javascript:`, `data:` y demás vectores de inyección en `href`.
   * @param {unknown} value
   * @returns {string}
   */
  function safeUrl(value) {
    const text = String(value === null || value === undefined ? "" : value).trim();
    if (!/^https?:\/\//i.test(text)) return "";
    return text;
  }

  /**
   * Ruta de imagen utilizable, o cadena vacía.
   *
   * Acepta rutas relativas del propio proyecto (`public/fotos/x.jpg`) y URLs
   * http(s). Rechaza cualquier cosa con esquema —`javascript:`, `data:`— y las
   * URLs sin protocolo (`//otro-sitio/x.jpg`), que apuntarían fuera.
   *
   * `safeUrl` no sirve aquí porque solo admite URLs absolutas, y las fotos del
   * proyecto son rutas locales.
   *
   * @param {unknown} value
   * @returns {string}
   */
  function safeImageSrc(value) {
    const text = String(value === null || value === undefined ? "" : value).trim();
    if (!text) return "";
    if (/^https?:\/\//i.test(text)) return text;
    if (text.startsWith("//")) return ""; // protocolo relativo: otro origen
    if (/^[a-z][a-z0-9+.-]*:/i.test(text)) return ""; // cualquier otro esquema
    return text;
  }

  /**
   * Normaliza una entrada de `images`.
   *
   * Admite la forma corta —una ruta suelta— y la completa, con `alt` y
   * `credit`. La corta existe porque el modelo de la sección 8 declara
   * `images` como lista de rutas; la completa, porque una fotografía sin
   * descripción no es accesible y sin crédito no es publicable.
   *
   * @param {unknown} entry
   * @returns {{ src: string, alt: string, credit: string }|null}
   */
  function normalizeImage(entry) {
    if (typeof entry === "string") {
      const src = safeImageSrc(entry);
      return src ? { src, alt: "", credit: "" } : null;
    }
    if (entry && typeof entry === "object") {
      const image = /** @type {Record<string, unknown>} */ (entry);
      const src = safeImageSrc(image.src);
      if (!src) return null;
      return {
        src,
        alt: typeof image.alt === "string" ? image.alt : "",
        credit: typeof image.credit === "string" ? image.credit : ""
      };
    }
    return null;
  }

  /**
   * Primera imagen utilizable de un lugar, o `null`.
   * @param {{ images?: unknown[] }} place
   */
  function firstImage(place) {
    for (const entry of place.images || []) {
      const image = normalizeImage(entry);
      if (image) return image;
    }
    return null;
  }

  /**
   * Valida un color hexadecimal de seis dígitos.
   *
   * Existe porque un color escrito como `"#7C8B4A;"` —con punto y coma
   * sobrante— es aceptado dentro de un atributo `style` pero rechazado en
   * silencio por `CSSStyleDeclaration.setProperty()`, así que el mismo lugar se
   * veía verde en el marcador y azul en la ficha. El validador de datos usa
   * esta misma función.
   * @param {unknown} value
   * @returns {boolean}
   */
  function isHexColor(value) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  }

  QEA.define("html", {
    escapeHtml,
    raw,
    html,
    toHtmlString,
    safeUrl,
    safeImageSrc,
    normalizeImage,
    firstImage,
    isHexColor
  });
})(globalThis);
