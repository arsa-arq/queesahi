# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [0.2.1] — 2026-09-07

### Corregido

- **`index.html` vuelve a abrirse con doble clic.** La 0.2.0 pasó a módulos ES
  y a leer los datos con `fetch`; el navegador bloquea ambas cosas bajo
  `file://`, así que la herramienta dejó de poder abrirse sin levantar un
  servidor. Peor: fallaba en silencio, porque el bloqueo impide que llegue a
  ejecutarse siquiera el código que mostraría el error.

  Era una regresión de producto, no un detalle técnico: quien escribe las
  fichas necesita comprobar cómo quedaron, y un prototipo de la Cátedra se abre
  en portátiles prestados, delante de gente que evalúa. Ver
  [ADR 0005](docs/adr/0005-abrir-con-doble-clic-sin-servidor.md).

### Cambiado

- **Scripts clásicos en vez de módulos ES.** Cada archivo de `src/` se registra
  en el espacio de nombres `QEA` (`src/app/namespace.js`) e `index.html` declara
  el orden de carga. Las capas siguen en archivos separados.
- **Datos embebidos en vez de `fetch`.** La fuente de verdad pasa de
  `public/data/places.json` a `public/data/places.js`, con el mismo contenido
  JSON cargado como script. `EmbeddedPlaceRepository` sustituye a
  `JsonPlaceRepository`.
- `npm start` sigue existiendo, pero solo para lo que de verdad lo necesita:
  probar desde el teléfono en la misma red.

### Añadido

- `npm run export:json`, que genera un `places.json` de verdad para otras
  herramientas. No se versiona, para que nadie lo confunda con el original.
- `tests/unit/cargaDeScripts.test.mjs`: seis pruebas que comprueban que el orden
  de los `<script>` de `index.html` respete las dependencias declaradas en la
  cabecera de cada archivo. Es la red bajo la fragilidad que introduce renunciar
  a los módulos.
- Un trabajo de integración continua que abre `index.html` con `file://` en
  Chrome sin interfaz y falla si no aparecen los seis marcadores.
- Regla CSS `[hidden] { display: none !important }`, que faltaba: varios
  contenedores declaran `display: flex` y anulaban el atributo.

### Nota sobre los tipos

Sin módulos, `tsc` ve un único ámbito global y `QEA.require()` devuelve `any`.
El chequeo dentro de cada archivo sigue siendo estricto; el que cruza fronteras
entre archivos se pierde. Es el precio de esta decisión, anotado en el ADR 0005
y en `docs/testing/estrategia-de-pruebas.md`.

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
- 43 pruebas unitarias con `node:test`, sin dependencias (49 desde la 0.2.1).
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

- **Los datos salen del código.** `PLACES_DATA` pasa a un archivo propio, con
  `schemaVersion` para poder migrar el formato más adelante. (La 0.2.1 cambia
  ese archivo de `places.json` a `places.js`.)
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

### Cambio incompatible (revertido en 0.2.1)

`index.html` dejó de funcionar con doble clic: pasó a necesitar módulos ES y
`fetch`, que el navegador bloquea bajo `file://`. Fue un error de criterio; la
0.2.1 lo corrige.

## [0.1.0] — 2026-08-29

Prototipo inicial: página única con mapa Leaflet, seis puntos de interés
embebidos, geolocalización y ficha editorial.
