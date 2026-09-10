/**
 * Carga la aplicación para las pruebas de Node.
 *
 * Los archivos de `src/` son scripts clásicos que se registran en
 * `globalThis.QEA` (ver docs/adr/0005). Como no tienen `import` ni `export`,
 * siguen siendo módulos ES válidos: importarlos aquí los ejecuta igual que
 * hace `index.html` con sus `<script>`.
 *
 * El orden de este archivo debe coincidir con el de `index.html`. Si divergen,
 * `pruebaDeOrdenDeCarga` en `namespace.test.mjs` lo detecta.
 */

import "../../src/app/namespace.js";
import "../../src/types/place.js";
import "../../src/utils/html.js";
import "../../src/app/config.js";
import "../../src/services/geoService.js";
import "../../src/services/locationService.js";
import "../../src/services/categoryService.js";
import "../../src/repositories/placeRepository.js";
import "../../src/repositories/embeddedPlaceRepository.js";
import "../../src/repositories/inMemoryPlaceRepository.js";

/**
 * Espacio de nombres ya poblado.
 *
 * No se cargan `mapView`, `placeSheet`, `toast` ni `main` porque necesitan DOM
 * y Leaflet. Esa parte se comprueba en el navegador, y en la v0.3 con
 * Playwright (docs/testing/estrategia-de-pruebas.md).
 */
export const QEA = globalThis.QEA;

/** @type {any} */
export const {
  html,
  geoService,
  categoryService,
  placeRepository,
  embeddedPlaceRepository,
  inMemoryPlaceRepository,
  types
} = QEA;
