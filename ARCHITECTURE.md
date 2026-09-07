<!--
  Copia canónica dentro del repositorio del documento
  «ARQUITECTURA_QUE_ES_AHI.md». A partir de la v0.2, esta es la versión que
  gobierna: cualquier cambio se hace aquí, mediante Pull Request.
-->

> **Estado de implementación — v0.2**
>
> El documento describe el destino. Lo que hoy está construido, y dónde el
> código se aparta del plan a propósito, se registra en `docs/adr/`:
>
> | Sección | Estado en v0.2 |
> |---------|----------------|
> | 3 · Stack (React + TypeScript + Vite) | **Aplazado.** JavaScript con módulos ES y tipos por JSDoc. Motivo y condiciones de salida en [ADR 0002](docs/adr/0002-sin-paso-de-construccion-en-v0.2.md). |
> | 5 · Capas | **Implementado.** `src/repositories`, `src/services`, `src/features`, `src/ui`. |
> | 7 · Persistencia v0.1 (`places.json`) | **Implementado.** `public/data/places.json` + `JsonPlaceRepository`. |
> | 8 · Modelo `Place` y estados editoriales | **Implementado y verificado** por `npm run validate` y `npm test`. |
> | 10 · Estructura del repositorio | **Implementada parcialmente**: faltan `content/`, `supabase/` y `tests/e2e` hasta que haya algo que poner en ellos. |
> | 11–13 · Gobierno, Git y CI | **Implementado.** Ver `CONTRIBUTING.md` y `.github/workflows/ci.yml`. |
> | 17 · Roles de los agentes | **Vigente.** Ver `AGENTS.md`. |

# Arquitectura y Enfoque de la Solución — ¿Qué es ahí?

## 1. Propósito

**¿Qué es ahí?** es una aplicación web progresiva orientada a la exploración urbana, geolocalizada y contextual. Su objetivo es permitir que un usuario identifique lugares de interés cercanos y consulte información histórica, urbana, patrimonial, cultural y social asociada a esos puntos.

La solución se concibe desde el inicio como un producto escalable, pero con una primera versión simple, funcional y rápida de desplegar.

---

## 2. Enfoque general de la solución

La arquitectura seguirá cinco principios:

1. **Mobile-first**: la experiencia principal será desde teléfono móvil.
2. **Local-first**: la aplicación podrá consultar información almacenada localmente y funcionar parcialmente sin conexión.
3. **Arquitectura desacoplada**: interfaz, lógica de negocio y persistencia deberán evolucionar de forma independiente.
4. **Desarrollo incremental**: el producto crecerá por versiones funcionales y verificables.
5. **Independencia del agente de IA**: Codex será el agente principal, pero Claude Code, Antigravity o desarrolladores humanos podrán trabajar sobre el mismo repositorio.

---

## 3. Stack tecnológico

### Frontend
- React
- TypeScript
- Vite
- HTML5
- CSS moderno

### Aplicación
- Progressive Web App (PWA)
- Service Worker
- Cache Storage
- IndexedDB

### Cartografía
- Leaflet
- OpenStreetMap

### Backend
- Supabase

### Base de datos
- PostgreSQL
- PostGIS

### Almacenamiento de archivos
- Supabase Storage

### Control de versiones
- Git
- GitHub

### Integración continua
- GitHub Actions

### Despliegue
Alternativas previstas:
- Cloudflare Pages
- Vercel
- GitHub Pages para versiones estáticas

---

## 4. Arquitectura de alto nivel

```text
Usuario
  |
  v
PWA / React
  |
  +--> Mapa Leaflet / OpenStreetMap
  |
  +--> Capa de servicios
  |
  +--> Repositorios
          |
          +--> JSON
          +--> IndexedDB
          +--> Supabase
                    |
                    +--> PostgreSQL
                    +--> PostGIS
                    +--> Storage
```

---

## 5. Arquitectura por capas

### 5.1 Capa de presentación

Responsable de:
- mapa;
- navegación;
- fichas de lugares;
- filtros;
- búsquedas;
- interacción móvil;
- estados de carga y error.

No deberá consultar directamente archivos JSON, IndexedDB o Supabase.

### 5.2 Capa de funcionalidades

Organiza la lógica por dominios funcionales.

Ejemplo:

```text
features/
├── map/
├── places/
├── location/
├── search/
└── offline/
```

### 5.3 Capa de servicios

Responsable de:
- cálculo de distancias;
- geolocalización;
- sincronización;
- búsquedas por proximidad;
- transformación de datos.

### 5.4 Capa de repositorios

Define una interfaz común de acceso a datos.

```text
PlaceRepository
├── JsonPlaceRepository
├── IndexedDbPlaceRepository
└── SupabasePlaceRepository
```

Esto permite cambiar la fuente de datos sin modificar los componentes de la interfaz.

### 5.5 Capa de persistencia

Puede incluir:
- JSON estático;
- IndexedDB local;
- Supabase;
- PostgreSQL/PostGIS.

---

## 6. Enfoque local-first

La aplicación deberá priorizar la información disponible en el dispositivo.

Flujo previsto:

```text
Usuario
  |
  v
IndexedDB
  |
  +--> respuesta inmediata
  |
  v
Sincronización en segundo plano
  |
  v
Supabase
```

Cuando exista conexión:
- se descargan cambios;
- se actualiza IndexedDB;
- se sincronizan modificaciones;
- se resuelven conflictos.

Cuando no exista conexión:
- se usa la información local disponible;
- se mantienen operativas las funciones esenciales.

---

## 7. Evolución de la persistencia

### Versión 0.1
Datos desde:

```text
public/data/places.json
```

Objetivo:
- máxima rapidez de desarrollo;
- cero dependencia de backend;
- validación temprana del producto.

### Versión 0.3
Incorporación de:

```text
IndexedDB
```

Objetivo:
- trabajo offline;
- cache local;
- preparación para sincronización.

### Versión 0.6
Incorporación de:

```text
Supabase + PostgreSQL + PostGIS
```

Objetivo:
- edición centralizada;
- usuarios;
- sincronización;
- consultas geoespaciales;
- crecimiento del producto.

---

## 8. Modelo de datos inicial

Entidad principal:

```text
Place
```

Campos sugeridos:

```text
id
slug
name
summary
description
whyItMatters
lookCloser
historicalContext
curiosity
latitude
longitude
location
categories
images
sources
status
createdAt
updatedAt
```

Estados editoriales:

```text
draft
review
approved
published
archived
```

---

## 9. Modelo geoespacial

En PostgreSQL/PostGIS se recomienda:

```sql
location geography(Point, 4326)
```

Esto permitirá realizar consultas como:

- lugares a menos de 50 m;
- lugares a menos de 100 m;
- lugares dentro de una zona;
- lugares cercanos a una ruta;
- filtros por categoría y proximidad.

---

## 10. Estructura del repositorio

```text
que-es-ahi/
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│
├── docs/
│   ├── adr/
│   ├── architecture/
│   ├── product/
│   ├── testing/
│   └── security/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── pages/
│   ├── repositories/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── styles/
│
├── public/
│   ├── icons/
│   ├── images/
│   └── data/
│
├── content/
│   ├── places/
│   ├── categories/
│   ├── sources/
│   └── media/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── functions/
│
├── README.md
├── AGENTS.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── package.json
```

---

## 11. Gobierno técnico

La fuente oficial de verdad será GitHub.

Todo cambio deberá estar asociado, cuando corresponda, a:
- Issue;
- rama;
- commit;
- Pull Request;
- pruebas;
- documentación;
- release.

No se permitirán cambios estructurales sin documentación previa.

---

## 12. Estrategia Git

Ramas principales:

```text
main
develop
```

Ramas de trabajo:

```text
feature/*
fix/*
refactor/*
docs/*
test/*
chore/*
```

Ejemplos:

```text
feature/map
feature/geolocation
feature/offline
fix/location-permission
```

---

## 13. Integración continua

Cada Pull Request deberá ejecutar:

```text
checkout
  |
  v
install
  |
  v
lint
  |
  v
typecheck
  |
  v
tests
  |
  v
build
```

Si alguna validación falla, el cambio no deberá integrarse.

---

## 14. Seguridad

No deberán almacenarse en Git:
- contraseñas;
- tokens privados;
- service role keys;
- certificados;
- credenciales.

Las variables sensibles deberán manejarse mediante:
- `.env.local`;
- secretos de GitHub;
- configuración segura del proveedor de hosting.

Las claves privilegiadas nunca deberán llegar al frontend.

---

## 15. Ambientes

### Local
Uso:
- desarrollo;
- pruebas;
- debugging.

### Staging
Ejemplo:

```text
staging.queesahi.com
```

Uso:
- QA;
- validación;
- revisión funcional.

### Producción

```text
queesahi.com
```

Uso:
- usuarios finales.

---

## 16. Dominio y publicación

Flujo recomendado:

```text
GitHub
  |
  v
Cloudflare Pages / Vercel
  |
  v
queesahi.com
```

El dominio se conectará mediante DNS.

Subdominios posibles:

```text
queesahi.com
admin.queesahi.com
api.queesahi.com
staging.queesahi.com
```

---

## 17. Rol de los agentes de IA

### Codex
Agente principal.

Responsabilidades:
- implementación;
- pruebas;
- documentación;
- Pull Requests;
- mantenimiento;
- migraciones;
- debugging.

### Claude Code
Agente de revisión.

Responsabilidades:
- code review;
- arquitectura;
- refactorización;
- seguridad;
- análisis de regresiones.

### Antigravity
Agente de validación funcional.

Responsabilidades:
- pruebas E2E;
- navegación;
- validación visual;
- pruebas móviles;
- experimentación.

---

## 18. Principio de portabilidad de agentes

La continuidad del proyecto no deberá depender de:
- memoria de conversaciones;
- prompts aislados;
- decisiones no documentadas;
- una única herramienta de IA.

Cualquier agente deberá poder incorporarse leyendo:

```text
README.md
AGENTS.md
ARCHITECTURE.md
ROADMAP.md
docs/adr/
Issues
Pull Requests
```

---

## 19. Roadmap técnico

### v0.1
- React;
- TypeScript;
- Vite;
- Leaflet;
- OpenStreetMap;
- cinco POI desde JSON;
- ficha básica;
- despliegue web.

### v0.2
- geolocalización;
- posición del usuario;
- cálculo de distancia;
- POI cercanos;
- botón “¿Qué es ahí?”.

### v0.3
- IndexedDB;
- almacenamiento local;
- funcionamiento offline básico.

### v0.4
- búsqueda;
- filtros;
- categorías;
- ficha ampliada.

### v0.5
- PWA instalable;
- service worker;
- cache offline.

### v0.6
- Supabase;
- PostgreSQL;
- PostGIS.

### v0.7
- autenticación;
- roles;
- panel administrativo;
- edición de contenidos.

### v0.8
- sincronización local-first;
- cola offline;
- resolución de conflictos.

### v0.9
- piloto público;
- analítica;
- pruebas en campo.

### v1.0
- versión estable;
- dominio definitivo;
- seguridad;
- rendimiento;
- operación productiva.

---

## 20. Criterios de evolución

La arquitectura podrá cambiar cuando exista una razón técnica o funcional documentada.

Todo cambio relevante deberá analizar:
- problema;
- alternativas;
- costo;
- impacto;
- riesgo;
- compatibilidad;
- consecuencias.

Las decisiones estructurales se documentarán mediante ADR.

---

## 21. Principio final

La prioridad del proyecto será:

```text
Producto
  >
Arquitectura
  >
Código
  >
Herramienta
```

Codex, Claude Code o Antigravity podrán cambiar con el tiempo.

La arquitectura, la documentación, la trazabilidad y la calidad del producto deberán mantenerse.
