# ¿Qué es ahí? / ¿What's there?

Exploración urbana geolocalizada del centro histórico de Bogotá. Abres el mapa,
pulsas **«¿Qué es ahí?»** y la aplicación te cuenta qué es el lugar que tienes
más cerca: qué pasó allí, por qué importa y qué mirar cuando estés delante.

Proyecto de la Cátedra Bogotá. Versión **0.2**.

## Ejecutarlo

Necesitas [Node.js](https://nodejs.org) 20 o superior. Nada más.

```bash
npm start
```

Y abre <http://localhost:8000>.

> **No abras `index.html` con doble clic.** La aplicación usa módulos ES y carga
> los datos con `fetch`; el navegador bloquea las dos cosas bajo el protocolo
> `file://`. Hace falta un servidor, aunque sea el de una línea de arriba.
>
> Si lo intentas, la página te lo explicará en pantalla en vez de quedarse
> muda: hay un script clásico en `index.html`, fuera de los módulos, que se
> ejecuta precisamente en ese caso.

Se necesita conexión a internet para las teselas de OpenStreetMap y para
Leaflet, que se cargan por CDN.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo en el puerto 8000 (`npm start -- 3000` para otro). |
| `npm run validate` | Revisa `public/data/places.json`: campos, coordenadas, duplicados, fuentes. |
| `npm test` | Pruebas unitarias. Sin dependencias: usa el `node:test` incorporado. |
| `npm run typecheck` | Verifica los tipos JSDoc con TypeScript. Requiere `npm install`. |
| `npm run check` | `validate` + `test`. Lo mínimo antes de proponer un cambio. |

## Qué incluye

- Mapa Leaflet + OpenStreetMap, pensado primero para el móvil.
- Seis lugares del centro histórico con ficha editorial: Plaza de Bolívar, Museo
  del Oro, Cerro de Monserrate, Teatro Colón, Chorro de Quevedo y Academia
  Colombiana de Historia.
- Botón **«¿Qué es ahí?»**: geolocaliza, calcula distancias (Haversine) y abre
  la ficha del lugar más cercano.
- Enlaces compartibles por lugar: `…/#/lugar/plaza-de-bolivar`. El botón
  «atrás» del navegador cierra la ficha.
- Última posición conocida guardada en `localStorage`, para responder aunque el
  GPS falle (primer gesto *local-first*).
- Estados de carga y error con mensajes que dicen qué hacer.
- Identidad de marca del PDF *Paleta de Colores y Logo*.

## Estructura

```text
que-es-ahi/
├── index.html              solo el esqueleto; ni estilos ni lógica
├── public/data/places.json los datos (capa de persistencia, v0.2)
├── src/
│   ├── app/                config.js y main.js — el único sitio que conecta capas
│   ├── repositories/       acceso a datos (JSON hoy; IndexedDB y Supabase después)
│   ├── services/           geoService.js (puro) y locationService.js (dispositivo)
│   ├── features/           map/, places/, location/
│   ├── ui/                 componentes sueltos (toast)
│   ├── types/              modelo Place en JSDoc
│   ├── utils/              html.js — escapado seguro
│   └── styles/             tokens.css (marca) y app.css
├── scripts/                serve.mjs y validate-places.mjs
├── tests/unit/             pruebas
└── docs/adr/               por qué el código es como es
```

La correspondencia con las capas de `ARCHITECTURE.md` es directa: presentación
(5.1) en `features/` y `ui/`, funcionalidades (5.2) en `features/`, servicios
(5.3) en `services/`, repositorios (5.4) en `repositories/` y persistencia (5.5)
en `public/data/`. **La presentación nunca accede a los datos directamente.**

## Paleta de marca

Definida como variables CSS en `src/styles/tokens.css`. Ningún otro archivo
escribe un color literal.

| Rol | Hex | Uso |
|---|---|---|
| Azul principal | `#04437F` | Logo, botón, marcador de usuario, Academia Colombiana de Historia |
| Azul profundo | `#04305C` | Fondo, avisos, telón de la ficha |
| Rojo ladrillo | `#C74A2C` | Plaza de Bolívar |
| Naranja ámbar | `#E0951E` | Museo del Oro |
| Verde oliva | `#7C8B4A` | Cerro de Monserrate |
| Teal | `#05707F` | Chorro de Quevedo, títulos de sección |
| Índigo | `#3C5393` | Teatro Colón |

Los cinco acentos aparecen juntos en la cinta bajo la cabecera y al pie del
banner de cada ficha. Cada lugar publicado usa un color y un emoji distintos;
`npm run validate` avisa si se repiten.

## Añadir un lugar

Ver [`AGENTS.md`](AGENTS.md). En resumen: editar `public/data/places.json`,
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

## Estado

La v0.2 aplaza a propósito React + TypeScript + Vite, que la arquitectura pide
para la v0.1. El motivo y las condiciones para migrar están en el
[ADR 0002](docs/adr/0002-sin-paso-de-construccion-en-v0.2.md): la separación en
capas ya está hecha en archivos reales, así que la migración será mecánica.
