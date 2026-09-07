# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [0.2.0] — 2026-09-05

Reestructuración a partir de la revisión del prototipo. La aplicación hace lo
mismo que antes desde fuera, salvo por las correcciones de contenido y los
enlaces compartibles; el cambio grande está debajo.

### Corregido

- **Academia Colombiana de Historia.** El sexto lugar se había añadido sin
  terminar de revisar:
  - `color` era `"#7C8B4A;"`. El punto y coma sobrante hacía que
    `setProperty()` descartara el valor en silencio, así que el marcador salía
    verde y la ficha, azul. Ahora usa `#04437F`, distinto al de los demás.
  - `id` y `slug` eran `"Academia Colombiana de la Historia"`, con espacios y
    mayúsculas. Ahora `academia-colombiana-de-historia`.
  - La dirección, las categorías y las fuentes estaban copiadas del Chorro de
    Quevedo: decía «Callejón del Embudo» para un edificio de la Calle 10.
  - Emoji repetido con el Teatro Colón (🎭); ahora 📚.
  - Nueve faltas de ortografía en el texto de la ficha.
  - Las fechas de 1902 y 1910 se contradecían; ahora se explican como fundación
    de la corporación y organización de su biblioteca. **Pendiente de
    verificación**: ver `docs/product/contenido-por-verificar.md`.
- **`getById` ignoraba el estado editorial.** `getAll` devolvía solo lo
  publicado, pero `getById` buscaba sobre todos los registros, así que un lugar
  en borrador seguía siendo accesible por su id. Ahora el filtro se aplica en
  los tres métodos del repositorio.
- **`README.md` decía cinco lugares** cuando ya eran seis, y su tabla de paleta
  no incluía el color del sexto.
- **El botón «¿Qué es ahí?» reescribía su propio DOM** al entrar en estado de
  espera (`outerHTML`), lo que hacía perder el foco. Ahora alterna clases.
- **`aria-modal="true"` sin atrapar el foco.** El tabulador seguía recorriendo
  el mapa por detrás de la ficha abierta. Resuelto con `inert`.

### Añadido

- Repositorio Git, con el prototipo recibido como primer commit.
- `AGENTS.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, `CHANGELOG.md` y `docs/adr/` (secciones 10, 11 y 18).
- `scripts/validate-places.mjs`: valida el contenido y falla la CI si hay
  errores. Detecta los seis defectos de arriba. Ver [ADR 0004](docs/adr/0004-validacion-automatica-del-contenido.md).
- 43 pruebas unitarias con `node:test`, sin dependencias.
- Integración continua en GitHub Actions: validate, test, typecheck.
- Verificación de tipos con JSDoc + `tsc` (`jsconfig.json`).
- `scripts/serve.mjs`: servidor de desarrollo sin dependencias.
- Enlaces compartibles por lugar (`#/lugar/<slug>`); el botón «atrás» cierra la
  ficha.
- Mensajes de error distintos según el motivo del fallo de ubicación (permiso
  denegado, tiempo agotado, sin señal, no soportado).
- Metadatos Open Graph para compartir el enlace.
- `escapeHtml`, `safeUrl` e `isHexColor` en `src/utils/html.js`.

### Cambiado

- **Los datos salen del código.** `PLACES_DATA` pasa a
  `public/data/places.json`, leído por `JsonPlaceRepository`. El documento
  lleva `schemaVersion` para poder migrar el formato más adelante.
- **El código se reparte en capas reales.** `index.html` pasa de 971 líneas a
  solo el esqueleto; la lógica vive en `src/`, con una capa por carpeta.
- **La geometría se separa del dispositivo.** `geoService.js` queda como
  funciones puras —comprobables sin navegador— y `locationService.js` concentra
  `navigator.geolocation` y `localStorage`.
- Los estilos se dividen en `tokens.css` (marca) y `app.css`. Ningún color
  literal fuera de los tokens.
- Todo el texto de las fichas pasa por un escapado de HTML. Ver
  [ADR 0003](docs/adr/0003-escapado-html-en-las-fichas.md).
- La versión mostrada en la cabecera pasa a `v0.2`, que es lo que corresponde a
  las funciones implementadas según la sección 19.

### Nota sobre el stack

Esta versión **no** migra a React + TypeScript + Vite, que la arquitectura pide
desde la v0.1. La decisión, sus motivos y las condiciones para revertirla están
en el [ADR 0002](docs/adr/0002-sin-paso-de-construccion-en-v0.2.md).

### Cambio incompatible

`index.html` ya no funciona abriéndolo con doble clic: hacen falta módulos ES y
`fetch`, que el navegador bloquea bajo `file://`. Usa `npm start`.

Quien lo intente **verá una explicación en pantalla con el comando a ejecutar**,
no una página muda. Bajo `file://` el navegador ni siquiera llega a cargar
`main.js`, así que el aviso lo da un script clásico incrustado en `index.html`,
que es el único código que se ejecuta en ese escenario. El mismo script avisa si
un `<script>` falla al cargar por cualquier otro motivo.

## [0.1.0] — 2026-08-29

Prototipo inicial: página única con mapa Leaflet, seis puntos de interés
embebidos, geolocalización y ficha editorial.
