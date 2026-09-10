# ROADMAP

Sigue la sección 19 de `ARCHITECTURE.md`. Cada versión debe ser **funcional y
verificable**: si no se puede enseñar funcionando, no está terminada.

## Hecho

### v0.1 — prototipo
Página única con mapa, cinco lugares y ficha. Validó el producto y quedó
registrada como primer commit del repositorio.

### v0.2 — arquitectura y contenido fiable ← **versión actual**
- Repositorio Git con historial, documentación de gobierno y CI.
- Código separado en capas reales: repositorios, servicios, funcionalidades.
- Datos en `public/data/places.js` con `EmbeddedPlaceRepository`.
- Geolocalización, distancia y lugar más cercano (lo que el documento pedía
  para la v0.2).
- Escapado de HTML en todas las fichas.
- Validador de contenido y pruebas unitarias en integración continua.
- Enlaces compartibles por lugar y foco atrapado en la ficha.
- Fotografía fija en la cabecera de cada ficha, con el texto deslizándose por
  debajo (adelanto de la v0.3).
- Se abre con doble clic, sin servidor ni instalación ([ADR 0005](docs/adr/0005-abrir-con-doble-clic-sin-servidor.md)).

## Siguiente

### v0.3 — búsqueda, filtros y lista ← **en curso**
El primer objetivo con seis lugares en el mapa es poder encontrarlos sin
depender del GPS.

- ~~Filtro por categoría en un menú lateral.~~ **Hecho en la 0.3.0**, con las
  siete categorías. Faltan los nombres definitivos y la adscripción real de
  cada predio.
- Lista de lugares accesible desde la cabecera, ordenable por cercanía.
- Búsqueda por nombre.
- ~~Ficha ampliada con imágenes.~~ **Hecho en la 0.2.2**; falta sustituir los
  marcadores de posición por fotografías reales.

Esta versión es la que probablemente dispare la migración a React: es la
primera con estado compartido entre vistas. Ver [ADR 0002](docs/adr/0002-sin-paso-de-construccion-en-v0.2.md).

### v0.4 — offline real
- `IndexedDbPlaceRepository` con la misma interfaz.
- Leaflet servido desde el propio dominio, no por CDN.
- Primera carga cacheada.

### v0.5 — PWA instalable
- Manifiesto y service worker.
- Teselas del centro histórico cacheadas para uso sin conexión.

### v0.6 — Supabase
- PostgreSQL + PostGIS, `location geography(Point, 4326)`.
- `SupabasePlaceRepository`.
- Consultas de proximidad en el servidor.

### v0.7 — edición de contenidos
- Autenticación y roles.
- Panel para el equipo editorial, con el flujo de estados
  `draft → review → approved → published`.

### v0.8 — sincronización local-first
Cola de cambios sin conexión y resolución de conflictos.

### v0.9 — piloto público
Pruebas en campo en La Candelaria, analítica, ajustes de contenido.

### v1.0 — estable
Dominio definitivo, seguridad, rendimiento y operación.

## Deuda técnica abierta

| Asunto | Dónde | Cuándo |
|---|---|---|
| Leaflet por CDN de terceros | `index.html` | v0.4 |
| Sin pruebas E2E | `tests/` | v0.3, con Playwright |
| El arranque bajo `file://` se verifica a mano | CI | v0.3 |
| Sin tipos entre archivos (`QEA.require` devuelve `any`) | `src/` | al migrar a TypeScript |
| `docs/product/contenido-por-verificar.md` con datos sin confirmar | contenido | continuo |
| Cuatro de las seis fotografías son marcadores de posición | `public/fotos/` | antes del piloto |
| Nombres y adscripción de las siete categorías, provisionales | `public/data/places.js` | pendiente del equipo |
| El color de la categoría 7 no viene del PDF de marca | `src/styles/tokens.css` | antes del piloto |
| El filtro no se refleja en la URL, así que no se puede compartir | `src/app/main.js` | v0.3 |
| Sin licencia declarada en `package.json` | raíz | antes de publicar |
| Carpetas `content/` y `supabase/` de la sección 10 aún sin crear | raíz | cuando haya qué poner en ellas |
