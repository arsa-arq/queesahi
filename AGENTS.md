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

## Comandos

```bash
npm start        # servidor de desarrollo en http://localhost:8000
npm run validate # valida public/data/places.json
npm test         # pruebas unitarias (node:test, sin dependencias)
npm run typecheck # tipos con JSDoc + tsc (requiere npm install)
npm run check    # validate + test, lo mínimo antes de un commit
```

`npm start`, `npm run validate` y `npm test` funcionan **sin `npm install`**:
solo necesitan Node 20 o superior. Únicamente `typecheck` necesita las
dependencias de desarrollo.

## Reglas que no se negocian

1. **La capa de presentación no toca los datos.** Todo acceso pasa por un
   repositorio (`src/repositories/`). Si un componente necesita `fetch`, está
   mal planteado.
2. **Ningún dato entra al DOM sin escapar.** Usa la plantilla `html` de
   `src/utils/html.js` o `textContent`. Ver [ADR 0003](docs/adr/0003-escapado-html-en-las-fichas.md).
3. **Los servicios de `geoService.js` son funciones puras.** Nada de DOM,
   `navigator` ni `localStorage`; eso vive en `locationService.js`.
4. **Nada se publica sin fuente.** `status: "published"` exige al menos una
   entrada en `sources`. Lo verifica `npm run validate`.
5. **No inventes contenido histórico.** Si no puedes citar de dónde sale un
   dato, déjalo en `status: "review"` y anótalo en
   `docs/product/contenido-por-verificar.md`.
6. **Ningún secreto en Git.** Ver `SECURITY.md` y la sección 14 de la
   arquitectura.
7. **Una decisión estructural sin ADR no se integra.** Ver [ADR 0001](docs/adr/0001-registro-de-decisiones-de-arquitectura.md).

## Añadir un lugar

1. Edita `public/data/places.json`, copiando la forma de una entrada existente.
2. `id` y `slug` en kebab-case, sin tildes ni espacios: `casa-de-narino`.
3. Color hexadecimal de seis dígitos, de la paleta de `src/styles/tokens.css`, y
   distinto al de los demás lugares publicados. Emoji también distinto.
4. Cita al menos una fuente real.
5. `npm run check`. Corrige errores y lee los avisos.
6. Rama `feature/lugar-<slug>`, Pull Request, y a revisión.

Si el contenido aún no está verificado, ponlo en `status: "review"`: no
aparecerá en el mapa, pero queda versionado y listo para promover.

## Dónde va cada cosa

| Necesitas… | Va en |
|---|---|
| Cambiar un texto o añadir un lugar | `public/data/places.json` |
| Cálculo geográfico | `src/services/geoService.js` (puro) |
| Algo del dispositivo (GPS, almacenamiento) | `src/services/locationService.js` |
| Nueva fuente de datos | `src/repositories/` con la interfaz de `placeRepository.js` |
| Algo del mapa | `src/features/map/mapView.js` (único archivo que conoce Leaflet) |
| Algo de la ficha | `src/features/places/placeSheet.js` |
| Constante o URL | `src/app/config.js` |
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
- [ ] Lo verificaste en el navegador, no solo en la terminal.
