# AGENTS.md — cómo trabajar en este repositorio

Este archivo es la puerta de entrada para cualquier agente de IA o persona que
llegue al proyecto. Está escrito para cumplir la sección 18 de
`ARCHITECTURE.md`: **la continuidad no puede depender de la memoria de una
conversación.** Si algo importante no está escrito aquí o en `docs/`, no existe.

## Lo primero, en orden

1. `README.md` — qué es el producto y cómo ejecutarlo.
2. Este archivo — cómo se trabaja.
3. `ARCHITECTURE.md` — el diseño y su estado de implementación.
4. `ROADMAP.md` — qué toca ahora.
5. `docs/adr/` — por qué el código es como es. **Léelos antes de proponer un
   cambio estructural**: varias decisiones que parecen omisiones son
   deliberadas y están justificadas ahí.

## Ejecutar la herramienta

**Doble clic en `index.html`.** Sin servidor y sin instalar nada. Es un
requisito del producto, no una comodidad heredada: ver
[ADR 0005](docs/adr/0005-abrir-con-doble-clic-sin-servidor.md). Si tu cambio lo
rompe, el cambio está mal.

## Comandos

```bash
npm start         # servidor local; solo para probar desde el móvil
npm run validate  # valida public/data/places.js
npm test          # pruebas unitarias (node:test, sin dependencias)
npm run typecheck # tipos con JSDoc + tsc (requiere npm install)
npm run check     # version:sync + validate + test, lo mínimo antes de un commit
```

Todo funciona **sin `npm install`** salvo `typecheck`, que necesita las
dependencias de desarrollo.

## Reglas que no se negocian

1. **`index.html` debe seguir abriéndose con doble clic.** Nada de módulos ES,
   nada de `fetch`, nada que exija un servidor.
2. **Un archivo nuevo en `src/` necesita su `<script>` en `index.html`**, en la
   posición correcta. Declara sus dependencias en la cabecera con la línea
   `Depende de:`; una prueba comprueba que el orden las respete.
3. **La capa de presentación no toca los datos.** Todo acceso pasa por un
   repositorio (`src/repositories/`).
4. **Ningún dato entra al DOM sin escapar.** Usa la plantilla `html` de
   `src/utils/html.js` o `textContent`. Ver [ADR 0003](docs/adr/0003-escapado-html-en-las-fichas.md).
5. **Los servicios de `geoService.js` son funciones puras.** Nada de DOM,
   `navigator` ni `localStorage`; eso vive en `locationService.js`.
6. **Nada se publica sin fuente.** `status: "published"` exige al menos una
   entrada en `sources`. Lo verifica `npm run validate`.
7. **Ninguna imagen sin derechos ni sin `alt`.** Solo entran fotografías
   propias, con licencia libre o cedidas por escrito. El `alt` es obligatorio
   en lugares publicados.
8. **No inventes contenido histórico.** Si no puedes citar de dónde sale un
   dato, déjalo en `status: "review"` y anótalo en
   `docs/product/contenido-por-verificar.md`.
9. **Ningún secreto en Git.** Ver `SECURITY.md` y la sección 14 de la
   arquitectura.
10. **Una decisión estructural sin ADR no se integra.** Ver [ADR 0001](docs/adr/0001-registro-de-decisiones-de-arquitectura.md).

## Añadir un lugar

1. Edita `public/data/places.js`, copiando la forma de una entrada existente.
2. `id` y `slug` en kebab-case, sin tildes ni espacios: `casa-de-narino`.
3. Registra su contenido en **al menos una** de las siete capas, dentro de
   `layers`. Cada capa lleva `text` —la respuesta a su pregunta orientadora—
   y, si hay, `evidence` y `sources`. Puede tener una, varias o las siete. Un
   lugar publicado sin ninguna capa no pasa `npm run validate`. Las preguntas
   de cada capa están en `docs/product/matriz-de-categorias.md`.
4. Emoji distinto al de los demás lugares publicados: con el color agrupando
   por categoría, el emoji es lo único que los diferencia en el mapa.
5. Cita al menos una fuente real.
6. Añade su fotografía en `public/fotos/<slug>.jpg` y rellena `images[0]` con
   `src`, `alt` y `credit`. Sin `alt` el validador falla; sin derechos de uso
   comprobados, la imagen no entra. Ver
   [`public/fotos/README.md`](public/fotos/README.md).
   Mientras no haya foto: `npm run fotos:placeholders` genera un provisional.
7. `npm run check`. Corrige errores y lee los avisos.
8. Rama `feature/lugar-<slug>`, Pull Request, y a revisión.

Si el contenido aún no está verificado, ponlo en `status: "review"`: no
aparecerá en el mapa, pero queda versionado y listo para promover.

## Dónde va cada cosa

| Necesitas… | Va en |
|---|---|
| Cambiar un texto o añadir un lugar | `public/data/places.js` |
| Una fotografía | `public/fotos/<slug>.jpg` + `images[0]` en `places.js` |
| Renombrar una categoría | `categories[].name` en `places.js` — nada más depende de él |
| Registrar una capa en un lugar | `layers["categoria-N"]` del lugar en `places.js` |
| Filtrar o contar por categoría | `src/services/categoryService.js` (puro) |
| El menú lateral | `src/features/categories/categoryMenu.js` |
| Cálculo geográfico | `src/services/geoService.js` (puro) |
| Algo del dispositivo (GPS, almacenamiento) | `src/services/locationService.js` |
| Nueva fuente de datos | `src/repositories/` con la interfaz de `placeRepository.js` |
| Algo del mapa | `src/features/map/mapView.js` (único archivo que conoce Leaflet) |
| Algo de la ficha | `src/features/places/placeSheet.js` |
| Constante o URL | `src/app/config.js` |
| Un archivo nuevo | `src/…` **y** su `<script>` en `index.html` |
| Color | `src/styles/tokens.css` — nunca un literal en otro CSS |

## Reparto de roles (sección 17 de `ARCHITECTURE.md`)

- **Codex** — agente principal: implementación, pruebas, documentación, PR.
- **Claude Code** — revisión: arquitectura, refactorización, seguridad,
  regresiones.
- **Antigravity** — validación funcional: pruebas E2E, navegación, móvil.

El reparto es una guía de responsabilidades, no una restricción: cualquier
agente puede hacer cualquier tarea si deja el rastro documental que pide la
sección 11.

## Antes de dar algo por terminado

- [ ] `npm run check` pasa.
- [ ] Si tocaste `src/`, `npm run typecheck` pasa.
- [ ] Si cambiaste el comportamiento, hay una prueba que lo demuestra.
- [ ] Si cambiaste la estructura, hay un ADR.
- [ ] `CHANGELOG.md` actualizado.
- [ ] Si publicas una versión: `package.json` actualizado y `npm run version:sync`
      ejecutado, o la caché servirá una mezcla rota (ver `scripts/sync-version.mjs`).
- [ ] Lo verificaste **abriendo `index.html` con doble clic**, no solo con
      `npm start` ni solo en la terminal.
