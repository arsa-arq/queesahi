# ADR 0005 — Abrir con doble clic es un requisito, no una comodidad

- **Fecha:** 2026-09-07
- **Estado:** aceptada
- **Modifica:** [ADR 0002](0002-sin-paso-de-construccion-en-v0.2.md), que aplazó el
  framework pero no protegió esta propiedad.

## Contexto

La v0.2 separó el código en capas usando **módulos ES** y movió los datos a
`places.json`, leído con `fetch`. Ambas cosas exigen un servidor: bajo el
protocolo `file://` el navegador bloquea los módulos por política de origen y
rechaza `fetch` sobre archivos locales.

El resultado fue que `index.html` dejó de funcionar con doble clic. Peor: falló
**en silencio**, porque el bloqueo impide que se ejecute hasta el código que
mostraría el error. Se veía la cabecera y un hueco azul.

Se intentó parchear con un aviso en pantalla que explicaba cómo levantar el
servidor. No era suficiente. La objeción de fondo, planteada por la
coordinación del proyecto, es correcta:

> «La solución anterior era sencilla de acceder.»

El ADR 0002 razonó bien sobre el framework y mal sobre esto. Argumentó que el
trabajo diario es editorial y que el equipo es mixto, y aun así introdujo una
dependencia de terminal para **ver** la herramienta. Un prototipo de la Cátedra
se abre en portátiles prestados, en una sala, delante de gente que evalúa; y
quien escribe las fichas necesita comprobar cómo quedaron sin pedirle permiso a
Node.

Abrir con doble clic no era una comodidad heredada del prototipo. Era una
propiedad del producto, y se perdió sin decidirlo.

## Decisión

**`index.html` debe abrirse con doble clic y funcionar por completo.** Esto es
ahora un requisito verificable, no una preferencia.

De ahí se siguen dos cambios técnicos:

1. **Scripts clásicos en vez de módulos ES.** Cada archivo de `src/` se envuelve
   en una función anónima y se registra en el espacio de nombres `QEA`
   (`src/app/namespace.js`). El orden de carga lo declara `index.html`.
2. **Datos embebidos en vez de `fetch`.** La fuente de verdad es
   `public/data/places.js`, un `<script>` que deja el documento en
   `globalThis.__QEA_PLACES__`. `EmbeddedPlaceRepository` lo lee sin red.
   `npm run export:json` genera un `places.json` de verdad cuando otra
   herramienta lo necesite; ese archivo no se versiona, para que nadie lo
   confunda con el original.

Lo que **no** cambia: las capas siguen en archivos separados, la presentación
sigue sin tocar los datos, el escapado de HTML sigue en su sitio, y las pruebas
siguen ejecutándose en Node. Los archivos no tienen `import` ni `export`, así
que son módulos ES válidos que solo se ejecutan: `tests/helpers/loadApp.mjs` los
importa en el mismo orden que `index.html`.

## Consecuencias

- Doble clic sobre `index.html` y la herramienta funciona: mapa, teselas, seis
  marcadores, fichas, enlaces profundos y geolocalización. `file://` es un
  origen «potencialmente confiable», así que el permiso de ubicación se puede
  pedir igual.
- `npm start` sigue existiendo, pero para lo que de verdad lo necesita: probar
  desde el teléfono en la misma red.
- **El orden de carga pasa a ser el grafo de dependencias.** Es la fragilidad
  que introduce esta decisión, y se compensa con tres cosas: cada archivo
  declara sus dependencias en la cabecera, `QEA.require()` falla con un mensaje
  que nombra el archivo que falta, y `tests/unit/cargaDeScripts.test.mjs`
  comprueba que `index.html` respete lo declarado.
- **Se pierde la verificación de tipos entre archivos.** Sin módulos, `tsc` trata
  todo como un único ámbito global y `QEA.require()` devuelve `any`. El chequeo
  dentro de cada archivo se mantiene intacto; el que cruza fronteras, no. Es la
  pérdida real de esta decisión y conviene no disimularla.
- Añadir un archivo nuevo obliga a añadir su `<script>` en `index.html`.

## Cómo se verificó

Chrome sin interfaz, sobre la URL `file://` real:

```bash
chrome --headless=new --dump-dom "file:///.../index.html"
```

Seis `poi-pin` en el DOM, doce teselas de Leaflet cargadas, ninguna clase
`fatal`, y la ficha abierta correctamente al pedir
`#/lugar/academia-colombiana-de-historia`.

## Alternativas descartadas

- **Dejar el aviso que explicaba cómo levantar el servidor.** Convierte un
  problema del proyecto en una tarea del usuario. Quien abre el archivo quiere
  ver el mapa, no aprender a usar una terminal.
- **Empaquetar con Vite y versionar el `dist/`.** Funciona con doble clic, pero
  entonces lo que se abre es código generado: editar una ficha exigiría
  recompilar, que es exactamente la fricción que el ADR 0002 quería evitar.
- **Volver al archivo único de 971 líneas.** Resuelve el acceso y devuelve todos
  los problemas que la v0.2 corrigió: sin capas, sin pruebas, sin validación de
  contenido.
- **Mantener los dos modos** (módulos si hay servidor, clásicos si no). Duplica
  el punto de entrada y garantiza que uno de los dos caminos esté siempre roto,
  porque solo se probaría el cómodo.
