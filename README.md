# ¿Qué es ahí? — v0.1 (página única autónoma)

Prototipo de exploración urbana geolocalizada para el centro histórico de Bogotá,
alineado con `ARQUITECTURA_QUE_ES_AHI.md`.

## Cómo usarlo

Abre `index.html` en un navegador (doble clic) o sírvelo:

```bash
python -m http.server 8000
```

Y entra a http://localhost:8000

Requiere conexión a internet para las teselas de OpenStreetMap y la librería
Leaflet (cargada por CDN). El botón **«¿Qué es ahí?»** pide permiso de ubicación
y muestra el punto de interés más cercano.

## Qué incluye

- Mapa Leaflet + OpenStreetMap, mobile-first.
- Identidad de marca del PDF *Paleta de Colores y Logo*: logo (pin + «?» sobre
  olas), nombre bilingüe **¿Qué es ahí? / ¿What's there?** y la paleta oficial.
- 5 puntos de interés de Bogotá con ficha editorial (Plaza de Bolívar, Museo del
  Oro, Cerro de Monserrate, Teatro Colón, Chorro de Quevedo). Cada lugar usa uno
  de los cinco colores de acento de la paleta.
- Geolocalización con cálculo de distancia (Haversine) y búsqueda por proximidad.
- Última posición conocida guardada en `localStorage` (guiño a *local-first*).
- Estados de carga y error.

## Paleta de colores (marca)

| Rol                    | Hex        | Uso en la app                                  |
|------------------------|------------|------------------------------------------------|
| Azul principal         | `#04437F`  | Logo, cabecera, botón, marcador de usuario     |
| Azul profundo (fondo)  | `#04305C`  | Fondo, toasts, telón de la ficha               |
| Rojo ladrillo          | `#C74A2C`  | Acento — Plaza de Bolívar                      |
| Naranja ámbar          | `#E0951E`  | Acento — Museo del Oro                         |
| Verde oliva            | `#7C8B4A`  | Acento — Cerro de Monserrate                   |
| Teal                   | `#05707F`  | Acento — Chorro de Quevedo, títulos de sección |
| Índigo                 | `#3C5393`  | Acento — Teatro Colón                          |

Definidos como variables CSS (`--brand-*`) al inicio de `index.html`. Los cinco
colores de acento aparecen juntos en la cinta bajo la cabecera y al pie del
banner de cada ficha.

## Recursos

- `logo.png` — logo con fondo transparente (extraído del PDF).
- `favicon.png` — icono de pestaña 64×64.

## Relación con la arquitectura del documento

Todo vive en un solo archivo, pero el JavaScript conserva la separación por capas
de las secciones 5 y 6 del documento:

| Capa (documento)        | En este archivo                                  |
|-------------------------|--------------------------------------------------|
| Persistencia (5.5)      | `PLACES_DATA` — modelo `Place` de la sección 8   |
| Repositorios (5.4)      | `InMemoryPlaceRepository` con `getAll` / `getById` |
| Servicios (5.3)         | `GeoService` — distancias, geolocalización, `nearest` |
| Presentación (5.1)      | `UI` — mapa, marcadores, ficha, toasts           |

Para pasar a la v0.1 "real" del documento (React + TypeScript + Vite), estos
mismos bloques se trasladan a `src/repositories`, `src/services` y
`src/features`, y `PLACES_DATA` pasa a `public/data/places.json`. La interfaz del
repositorio no cambia, así que la fuente de datos puede migrar luego a IndexedDB
o Supabase sin tocar la presentación.

## Pendiente para versiones siguientes

- Migrar a React + TS + Vite y a la estructura de carpetas de la sección 10.
- `places.json` externo + `JsonPlaceRepository`.
- IndexedDB (v0.3), PWA / service worker (v0.5), Supabase + PostGIS (v0.6).
- Descargar Leaflet como dependencia local en lugar de CDN.
