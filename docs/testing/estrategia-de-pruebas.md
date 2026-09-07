# Estrategia de pruebas

Sección 13 de `ARCHITECTURE.md`. La idea de fondo: **probar lo que se rompe en
silencio.**

Los defectos que la revisión de la v0.1 encontró no hacían fallar la
aplicación. Un color mal escrito, un filtro de estado que no se aplicaba, una
dirección copiada: todo seguía funcionando, y por eso nadie los vio. Esas son
las cosas que aquí se automatizan.

## Qué se prueba y cómo

| Capa | Herramienta | Estado |
|---|---|---|
| Servicios puros (`geoService`) | `node:test` | 12 pruebas |
| Utilidades (`html`) | `node:test` | 11 pruebas |
| Repositorios | `node:test` con dobles de `fetch` | 13 pruebas |
| Datos reales (`places.json`) | `node:test` + `validate-places.mjs` | 7 pruebas + validador |
| Presentación (mapa, ficha) | manual, en navegador | pendiente de E2E en v0.3 |

```bash
npm test          # todas las pruebas
npm run validate  # solo el contenido
npm run check     # ambas
```

Sin dependencias: `node:test` viene con Node. Que las pruebas corran sin
`npm install` es deliberado (ver [ADR 0002](../adr/0002-sin-paso-de-construccion-en-v0.2.md)).

## Por qué la geometría está separada del dispositivo

`geoService.js` son funciones puras, sin DOM ni `navigator`. Por eso se puede
probar con Node, sin navegador ni simuladores. Todo lo que toca el dispositivo
—GPS, `localStorage`— vive en `locationService.js`, que es fino a propósito:
cuanto menos código haya ahí, menos código queda sin probar.

Esa frontera es la razón de que 43 pruebas cubran lo que importa sin montar un
entorno de navegador.

## Los tipos son parte de las pruebas

`npm run typecheck` pasa `tsc` sobre el JavaScript anotado con JSDoc
(`jsconfig.json`, `checkJs: true`, `strict: true`). Cubre `src/` y `scripts/`.

Las pruebas quedan **fuera** de la verificación de tipos a propósito: usan
fixtures parciales de `Place` para que cada caso se lea de un vistazo, y
exigirles el objeto completo las volvería ilegibles sin ganar nada. Su
corrección la garantiza ejecutarlas.

## Qué falta

- **E2E con Playwright (v0.3).** Los caminos que hoy solo se comprueban a mano:
  abrir una ficha desde un marcador, cerrar con Escape y con el botón «atrás»,
  compartir un enlace `#/lugar/<slug>`, y el botón «¿Qué es ahí?» con permiso
  concedido, denegado y sin señal.
- **Pruebas de accesibilidad**, sobre todo del foco atrapado en la ficha.
- **Pruebas en dispositivo real**, que es donde de verdad se comporta el GPS.

## Al añadir una prueba

Que falle **antes** de la corrección. Una prueba que nunca ha estado en rojo no
demuestra nada. Cuando cubra una regresión, dilo en el propio nombre o en un
comentario, como en `placeRepository.test.mjs`.
