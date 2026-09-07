/**
 * Construcción segura de HTML.
 *
 * La ficha de cada lugar se arma con `innerHTML`. Mientras los datos vivían
 * dentro de `index.html` eso era inofensivo, pero el roadmap los mueve a
 * `places.json` (v0.2), a IndexedDB (v0.3), a Supabase (v0.6) y a un panel de
 * edición con usuarios (v0.7). A partir de ahí, texto escrito por otra persona
 * termina inyectado en el DOM: sin escapar, es XSS almacenado.
 *
 * Regla del proyecto: nada que venga de datos entra al DOM sin pasar por aquí.
 * Ver docs/adr/0003-escapado-html-en-las-fichas.md
 */

/** @type {Record<string, string>} */
const ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

/** Marca interna para fragmentos ya escapados. */
const SAFE = Symbol("qea:html-safe");

/**
 * @typedef {{ [SAFE]: true, value: string }} SafeHtml
 */

/**
 * Escapa los cinco caracteres con significado en HTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}

/**
 * Marca una cadena como HTML ya seguro. Úsalo solo con fragmentos construidos
 * por el propio código, nunca con datos de entrada.
 * @param {string} value
 * @returns {SafeHtml}
 */
export function raw(value) {
  return { [SAFE]: true, value: String(value) };
}

/**
 * Convierte cualquier valor interpolado en HTML seguro.
 * - `null`, `undefined`, `false` y `true` desaparecen (permiten condicionales).
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
    return /** @type {SafeHtml} */ (value).value;
  }
  return escapeHtml(value);
}

/**
 * Plantilla etiquetada que escapa todas las interpolaciones.
 *
 *   html`<h2>${place.name}</h2>`   // place.name queda escapado
 *   html`<div>${html`<b>ok</b>`}</div>` // los fragmentos anidados se respetan
 *
 * @param {TemplateStringsArray} strings
 * @param {...unknown} values
 * @returns {SafeHtml}
 */
export function html(strings, ...values) {
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
export function toHtmlString(value) {
  return render(value);
}

/**
 * Devuelve la URL si su esquema es seguro para un enlace; si no, cadena vacía.
 * Bloquea `javascript:`, `data:` y demás vectores de inyección en `href`.
 * @param {unknown} value
 * @returns {string}
 */
export function safeUrl(value) {
  const text = String(value ?? "").trim();
  if (!/^https?:\/\//i.test(text)) return "";
  return text;
}

/**
 * Valida un color hexadecimal de seis dígitos.
 *
 * Existe porque un color escrito como `"#7C8B4A;"` —con punto y coma sobrante—
 * es aceptado dentro de un atributo `style` pero rechazado en silencio por
 * `CSSStyleDeclaration.setProperty()`, así que el mismo lugar se veía verde en
 * el marcador y azul en la ficha. El validador de datos usa esta misma función.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}
