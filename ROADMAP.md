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
- Datos en `public/data/places.json` con `JsonPlaceRepository`.
- Geolocalización, distancia y lugar más cercano (lo que el documento pedía
  para la v0.2).
- Escapado de HTML en todas las fichas.
- Validador de contenido y pruebas unitarias en integración continua.
- Enlaces compartibles por lugar y foco atrapado en la ficha.

## Siguiente

### v0.3 — búsqueda, filtros y lista
El primer objetivo con seis lugares en el mapa es poder encontrarlos sin
depender del GPS.

- Lista de lugares accesible desde la cabecera, ordenable por cercanía.
- Búsqueda por nombre y filtro por categoría.
- Ficha ampliada con imágenes (`images` ya está en el modelo, vacío).

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
| `docs/product/contenido-por-verificar.md` con datos sin confirmar | contenido | continuo |
| Sin licencia declarada en `package.json` | raíz | antes de publicar |
| Carpetas `content/` y `supabase/` de la sección 10 aún sin crear | raíz | cuando haya qué poner en ellas |
