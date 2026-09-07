# ADR 0003 — Todo dato pasa por un escapado antes de llegar al DOM

- **Fecha:** 2026-09-05
- **Estado:** aceptada

## Contexto

La ficha de cada lugar se construye con `innerHTML` a partir de campos de texto
del modelo `Place`: nombre, resumen, descripción, categorías, fuentes.

En la versión anterior esos campos se interpolaban tal cual:

```js
this.el.sheetBody.innerHTML = `
  <p class="summary">${place.summary || ""}</p>
  ...
`;
```

Mientras los datos estaban escritos a mano dentro de `index.html`, eso era
inofensivo: el único que podía inyectar HTML era quien ya estaba editando el
archivo. Pero el roadmap mueve esos mismos datos a `places.json` (v0.2), a
IndexedDB (v0.3), a Supabase (v0.6) y a un panel de edición con varios usuarios
(v0.7). En cuanto el texto lo escriba otra persona, cada campo se convierte en
un vector de XSS almacenado, y el fallo aparecería a mitad de una migración,
donde nadie lo está buscando.

Arreglarlo ahora cuesta un archivo pequeño. Arreglarlo en la v0.7 significa
auditar toda la interfaz.

## Decisión

`src/utils/html.js` expone una plantilla etiquetada `html` que escapa **todas**
las interpolaciones, y un `raw()` explícito para los fragmentos que construye el
propio código.

```js
body.innerHTML = toHtmlString(html`<p class="summary">${place.summary}</p>`);
```

Regla del proyecto: **ningún valor procedente de datos entra al DOM sin pasar
por `html`, `escapeHtml` o `textContent`.** Un `raw()` sobre un dato es motivo
de rechazo en la revisión.

Complementos de la misma decisión:

- `safeUrl()` solo deja pasar `http:` y `https:`, para que un día un campo de
  URL no acabe siendo un `javascript:` en un `href`.
- `isHexColor()` valida los colores antes de escribirlos en el CSS.

## Consecuencias

- El código de la ficha se lee prácticamente igual que antes; el escapado es
  invisible en el sitio de uso.
- Las pruebas de `tests/unit/html.test.mjs` fijan el comportamiento, incluido el
  caso de las etiquetas anidadas, que es donde este patrón se suele romper.
- Cuando llegue Supabase no habrá que revisar la capa de presentación.

## Alternativas descartadas

- **Sanear el HTML con DOMPurify.** Añade una dependencia y resuelve un problema
  más difícil del que tenemos: aquí no se necesita HTML de entrada, se necesita
  texto plano.
- **Construir el DOM con `createElement` y `textContent`.** Es seguro por
  construcción, pero triplica el tamaño del código de la ficha y lo vuelve
  difícil de leer, que es donde de verdad se cuelan los errores.
- **Escapar en la capa de datos.** Guardar HTML escapado en la base de datos
  contamina el modelo y rompe en cuanto el mismo dato se use en un contexto que
  no sea HTML (un PDF, un correo, una API).
