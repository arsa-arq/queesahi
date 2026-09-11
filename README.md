# ¿Qué es ahí? / ¿What's there?

Exploración urbana geolocalizada del centro histórico de Bogotá. Abres el mapa,
pulsas **«¿Qué es ahí?»** y la aplicación te cuenta qué es el lugar que tienes
más cerca: qué pasó allí, por qué importa y qué mirar cuando estés delante.

Proyecto de la Cátedra Bogotá. Versión **0.3**.

## Abrirlo

**Doble clic en `index.html`.** Nada que instalar, nada que compilar.

Solo hace falta conexión a internet, porque el mapa (Leaflet) y las teselas
(OpenStreetMap) se cargan desde la red.

Que esto siga siendo así es un requisito del proyecto, no una casualidad: está
escrito en el [ADR 0005](docs/adr/0005-abrir-con-doble-clic-sin-servidor.md) y
lo verifica una prueba.

### Con servidor local

Solo lo necesitas para probar desde el teléfono en la misma red. Requiere
[Node.js](https://nodejs.org) 20 o superior:

```bash
npm start
```

Y abre <http://localhost:8000>.

## Publicarlo

Para que otras personas la usen desde su teléfono, se publica en GitHub Pages.
El paso a paso —y por qué subir archivos arrastrándolos a la web de GitHub no
funciona— está en
[`docs/despliegue-github.md`](docs/despliegue-github.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor local en el puerto 8000 (`npm start -- 3000` para otro). Opcional. |
| `npm run validate` | Revisa `public/data/places.js`: campos, coordenadas, duplicados, fuentes. |
| `npm test` | Pruebas unitarias. Sin dependencias: usa el `node:test` incorporado. |
| `npm run typecheck` | Verifica los tipos JSDoc con TypeScript. Requiere `npm install`. |
| `npm run export:json` | Exporta los datos a `places.json` para otras herramientas. |
| `npm run fotos:placeholders` | Regenera las imágenes provisionales de `public/fotos/`. |
| `npm run version:sync` | Sella el CSS y el JS de `index.html` con la versión, contra la caché. |
| `npm run check` | `version:sync` + `validate` + `test`. Lo mínimo antes de proponer un cambio. |

## Qué incluye

- Mapa Leaflet + OpenStreetMap, pensado primero para el móvil.
- Seis lugares del centro histórico con ficha editorial: Plaza de Bolívar, Museo
  del Oro, Cerro de Monserrate, Teatro Colón, Chorro de Quevedo y Academia
  Colombiana de Historia.
- Botón **«¿Qué es ahí?»**: geolocaliza, calcula distancias (Haversine) y abre
  la ficha del lugar más cercano.
- Fotografía fija en la cabecera de cada ficha: el texto se desliza por debajo
  al desplazarse, y la imagen no se mueve.
- Siete capas de lectura por lugar —de una a las siete—, cada una con su
  propio contenido, y un menú lateral para filtrar por ellas. El marcador lleva
  un anillo con un tramo del color de cada capa registrada.
- Enlaces compartibles por lugar: `…/#/lugar/plaza-de-bolivar`. El botón
  «atrás» del navegador cierra la ficha.
- Última posición conocida guardada en `localStorage`, para responder aunque el
  GPS falle (primer gesto *local-first*).
- Estados de carga y error con mensajes que dicen qué hacer.
- Identidad de marca del PDF *Paleta de Colores y Logo*.

## Estructura

```text
que-es-ahi/
├── index.html              esqueleto y orden de carga de los scripts
├── public/data/places.js   los datos (capa de persistencia, v0.2)
├── public/fotos/           una imagen por lugar — ver su README
├── src/
│   ├── app/                namespace.js, config.js y main.js
│   ├── repositories/       acceso a datos (embebidos hoy; IndexedDB y Supabase después)
│   ├── services/           geoService.js (puro) y locationService.js (dispositivo)
│   ├── features/           map/, places/, location/
│   ├── ui/                 componentes sueltos (toast)
│   ├── types/              modelo Place en JSDoc
│   ├── utils/              html.js — escapado seguro
│   └── styles/             tokens.css (marca) y app.css
├── scripts/                serve.mjs, validate-places.mjs, export-json.mjs
├── tests/unit/             pruebas
└── docs/adr/               por qué el código es como es
```

La correspondencia con las capas de `ARCHITECTURE.md` es directa: presentación
(5.1) en `features/` y `ui/`, funcionalidades (5.2) en `features/`, servicios
(5.3) en `services/`, repositorios (5.4) en `repositories/` y persistencia (5.5)
en `public/data/`. **La presentación nunca accede a los datos directamente.**

Los archivos son scripts clásicos, no módulos ES: es lo que permite el doble
clic. A cambio, **el orden de los `<script>` en `index.html` importa**. Cada
archivo declara de qué depende en su cabecera, y una prueba comprueba que el
orden lo respete.

## Fotografías

Cada lugar tiene una imagen en `public/fotos/`, con el `slug` como nombre. Se
muestra fija en la parte superior de la ficha y el texto pasa por debajo al
desplazarse.

**Las que hay ahora son marcadores de posición, no fotografías.** Son PNG con
el color del lugar, su emoji y la palabra «Fotografía pendiente», para que nadie
las confunda con material real. El flujo para sustituirlas —y los requisitos de
licencia, que no son negociables— está en
[`public/fotos/README.md`](public/fotos/README.md).

Si una imagen falta o no carga, la ficha no se rompe: vuelve al encabezado con
el degradado de marca.

## Categorías

Los predios se clasifican en **siete categorías**. El catálogo vive en
`public/data/places.js`, junto a los lugares:

| # | Categoría | Capa de ciudad |
|---|---|---|
| 1 | Histórica | Histórico-memorial |
| 2 | Institucional | Institucional y normativa |
| 3 | Poblacional | Poblacional y de actores sociales |
| 4 | Territorial | Territorial, cartográfica y de uso del suelo |
| 5 | Bienestar | Bienestar, espacio público y vida cotidiana |
| 6 | Civilidad | Prospectiva, patrimonial y de civilidad |
| 7 | Capa inusual | Inusual |

Cada una trae además su eje de Cátedra, su pregunta orientadora, qué estudia y
qué evidencia produce. Eso es lo que guía la redacción de las fichas:
[`docs/product/matriz-de-categorias.md`](docs/product/matriz-de-categorias.md).

### Un lugar, varias capas

Las categorías no son tipos de lugar excluyentes sino **capas de lectura**: un
mismo lugar puede registrar contenido en una, en varias o en las siete. Cada
capa registrada lleva su propio texto, y opcionalmente sus evidencias y fuentes:

```js
"layers": {
  "categoria-1": {
    "text": "Lo que responde a la pregunta orientadora de la capa.",
    "evidence": ["Línea del tiempo"],
    "sources": ["Archivo de Bogotá"]
  },
  "categoria-3": { "text": "…" }
}
```

**Un lugar pertenece a una capa si y solo si tiene contenido registrado en
ella.** No hay una lista de pertenencia aparte. Ver
[ADR 0006](docs/adr/0006-capas-de-lectura-con-contenido-propio.md).

En el mapa, el marcador lleva un anillo con un tramo del color de cada capa
registrada. En la ficha, una sección «Capas de lectura» muestra cada una con su
pregunta orientadora, y unos accesos arriba permiten saltar a cada capa.

El menú lateral —el botón de la esquina superior izquierda— filtra por
categoría. La selección es múltiple y suma: marcar dos muestra los predios de
ambas. Sin nada marcado se ven todos.

**Estado actual:** los seis lugares tienen registrada la capa Histórica —su
contexto histórico, que responde exactamente a esa pregunta— y ninguna otra.
Por eso los seis marcadores son rojos y las demás capas aparecen vacías en el
menú. Se irán llenando a medida que el equipo registre contenido.

No confundir las capas con `tags`: las etiquetas editoriales libres
—«Historia», «Mirador», «Arqueología»— siguen existiendo y se muestran en la
ficha, pero no filtran nada.

## Paleta de marca

Definida como variables CSS en `src/styles/tokens.css`. Ningún otro archivo
escribe un color literal.

| Rol | Hex | Uso |
|---|---|---|
| Azul principal | `#04437F` | Logo, botón, marcador de usuario, Categoría 6 |
| Azul profundo | `#04305C` | Fondo, avisos, telón de la ficha |
| Rojo ladrillo | `#C74A2C` | Categoría 1 |
| Naranja ámbar | `#E0951E` | Categoría 2 |
| Verde oliva | `#7C8B4A` | Categoría 3 |
| Teal | `#05707F` | Categoría 5, títulos de sección |
| Índigo | `#3C5393` | Categoría 4 |
| Ciruela | `#6F4A7F` | Categoría 7 — **provisional**, no viene del PDF de marca |

Los cinco acentos originales aparecen juntos en la cinta bajo la cabecera y al
pie del banner de cada ficha.

Desde que existen las capas, **el color dice desde dónde se ha leído un lugar,
no qué lugar es**: el anillo del marcador lleva un tramo por capa registrada.
Lo que distingue un lugar de otro es el emoji, y `npm run validate` avisa si dos
lugares publicados repiten el suyo o si dos capas comparten color.

## Añadir un lugar

Ver [`AGENTS.md`](AGENTS.md). En resumen: editar `public/data/places.js`,
`npm run check`, y Pull Request.

## Documentación

| Archivo | Para qué |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Cómo trabajar aquí. **Empieza por aquí si eres nuevo.** |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | El diseño y su estado de implementación. |
| [`ROADMAP.md`](ROADMAP.md) | Qué viene y qué condiciones lo disparan. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Ramas, commits, Pull Requests. |
| [`SECURITY.md`](SECURITY.md) | Secretos, dependencias, datos personales. |
| [`CHANGELOG.md`](CHANGELOG.md) | Qué cambió en cada versión. |
| [`docs/adr/`](docs/adr/) | Por qué el código es como es. |
| [`docs/product/`](docs/product/) | Criterios editoriales y contenido pendiente. |
| [`docs/despliegue-github.md`](docs/despliegue-github.md) | Subir el proyecto y publicarlo en línea. |

## Estado

La v0.2 aplaza a propósito React + TypeScript + Vite, que la arquitectura pide
para la v0.1, y renuncia también a los módulos ES. Las dos decisiones tienen el
mismo motivo y están documentadas:
[ADR 0002](docs/adr/0002-sin-paso-de-construccion-en-v0.2.md) y
[ADR 0005](docs/adr/0005-abrir-con-doble-clic-sin-servidor.md). La separación en
capas ya está hecha en archivos reales, así que la migración, cuando toque, será
mecánica.
