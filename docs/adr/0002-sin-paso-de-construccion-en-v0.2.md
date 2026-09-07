# ADR 0002 — Aplazar React + TypeScript + Vite hasta la v0.4

- **Fecha:** 2026-09-05
- **Estado:** aceptada, con una corrección posterior
- **Corregida por:** [ADR 0005](0005-abrir-con-doble-clic-sin-servidor.md)

> **Corrección (2026-09-07).** Este ADR acertó al aplazar React, pero al elegir
> módulos ES rompió sin querer una propiedad del producto: poder abrir
> `index.html` con doble clic. El ADR 0005 la restituye sustituyendo los módulos
> por scripts clásicos. Todo lo que sigue vale, salvo las menciones a módulos ES
> y a `fetch`.

## Contexto

La sección 3 de `ARCHITECTURE.md` fija React, TypeScript y Vite como stack, y la
sección 19 los sitúa ya en la v0.1. La versión recibida, en cambio, era una
única página HTML de 971 líneas sin build.

Había que decidir entre dos saltos muy distintos:

1. Migrar ahora a React + TypeScript + Vite.
2. Separar primero el código en capas reales y aplazar el framework.

Tres hechos pesaron en la decisión:

- **El trabajo diario del proyecto es editorial, no de interfaz.** Lo que va a
  crecer semana a semana es el número de lugares y la calidad de sus fichas. Con
  un JSON, añadir un lugar es editar un archivo de texto; con un build, es
  instalar dependencias y compilar.
- **El equipo es mixto.** En la Cátedra participan personas que no son
  desarrolladoras. Un `npm install` fallido es una barrera real para quien solo
  quiere corregir un dato.
- **La sección 21 del propio documento ordena las prioridades:** producto >
  arquitectura > código > herramienta. React es herramienta.

Lo que sí era urgente era la **arquitectura**: la versión anterior tenía las
capas separadas solo por comentarios dentro de un archivo, y ningún límite real
que impidiera saltárselas.

## Decisión

En la v0.2 se separa el código en archivos y capas reales —`src/repositories`,
`src/services`, `src/features`, `src/ui`, `src/types`— usando módulos ES
nativos, sin ningún paso de construcción. Los tipos se declaran con JSDoc y se
verifican con `tsc --noEmit` (`jsconfig.json`, `checkJs`), de modo que el rigor
de TypeScript está presente sin compilador de por medio.

La estructura de carpetas se elige de forma que la migración posterior sea
mecánica: `index.html` en la raíz, código en `src/`, activos en `public/` es
exactamente el diseño que Vite espera.

**Condiciones de salida.** Se migra a React + TypeScript + Vite cuando ocurra la
primera de estas:

- la interfaz necesite estado compartido entre varias vistas (búsqueda y
  filtros de la v0.4);
- haya que instalar dependencias de terceros en tiempo de ejecución;
- se empiece el service worker de la v0.5, que agradece un empaquetador.

## Consecuencias

- El proyecto arranca con `npm start` y solo Node instalado; sin `npm install`
  para ver la aplicación funcionando. (Desde el ADR 0005, ni siquiera eso: basta
  el doble clic.)
- Los archivos `.js` con JSDoc se convierten en `.ts` casi literalmente: los
  `@typedef` pasan a `interface` y los `@param` a firmas.
- Se pierden JSX y el ecosistema de componentes. Aceptable mientras la interfaz
  sean un mapa, un botón y una ficha.
- El navegador carga una veintena de módulos sin empaquetar. Irrelevante en
  desarrollo y aceptable en producción con HTTP/2.
- Hay que resistir la tentación de meter lógica en `index.html`: si vuelve a
  crecer, la decisión ha caducado.

## Alternativas descartadas

- **Migrar a Vite ahora.** Cumple el documento al pie de la letra, pero pone una
  barrera de herramientas delante de la tarea que de verdad hace avanzar el
  producto —escribir fichas— y a cambio no arregla ninguno de los defectos
  encontrados en la revisión.
- **Seguir con un solo archivo y arreglar solo los errores.** No resuelve el
  problema de fondo: sin límites reales entre capas, la siguiente versión
  vuelve a mezclarlas.
