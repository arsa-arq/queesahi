# ADR 0004 — El contenido se valida con un script, no con la vista

- **Fecha:** 2026-09-05
- **Estado:** aceptada

## Contexto

La revisión de la versión anterior encontró seis defectos en el último lugar
añadido al mapa. Todos tenían la misma naturaleza: eran **mecánicos y
detectables por una máquina**.

| Defecto | Efecto |
|---|---|
| `color: "#7C8B4A;"` | El punto y coma sobrante es válido dentro de un atributo `style` pero `setProperty()` lo descarta en silencio: el mismo lugar salía verde en el marcador y azul en la ficha. |
| `id` y `slug` con espacios y mayúsculas | Rompía la convención del resto y el futuro enrutado por slug. |
| Dirección copiada de otro lugar | La ficha decía «Callejón del Embudo» para un edificio de la Calle 10. |
| Emoji y color repetidos | Dos pines indistinguibles en el mapa. |
| Faltas de ortografía | Pérdida de credibilidad en un proyecto cuyo producto *es* el texto. |

Ninguno rompía la aplicación, y por eso ninguno se notó: el prototipo seguía
funcionando. Se descubrieron leyendo, que es la forma más cara y menos fiable de
encontrarlos.

Esto va a empeorar. El proyecto crece añadiendo lugares, y buena parte de ese
trabajo lo harán personas centradas en la historia de Bogotá, no en JSON.

## Decisión

`scripts/validate-places.mjs` valida `public/data/places.json` en cada Pull
Request. Comprueba, como **errores** que rompen la construcción:

- campos obligatorios presentes y no vacíos;
- `id` y `slug` en kebab-case, y únicos en todo el archivo;
- coordenadas numéricas y dentro de la caja de Bogotá;
- `status` dentro de los cinco estados editoriales de la sección 8;
- `color` como hexadecimal de seis dígitos;
- fechas en formato `YYYY-MM-DD`, con `updatedAt` no anterior a `createdAt`;
- **al menos una fuente en todo lugar publicado.**

Y como **avisos** que no rompen nada pero se leen en la revisión: colores o
emojis repetidos entre lugares publicados, direcciones idénticas —la firma
típica de un copiar y pegar— y espacios sobrantes.

El validador importa `PLACE_STATUSES` y `isHexColor` del propio código de la
aplicación: una sola definición de qué es válido, no dos que se desincronizan.

## Consecuencias

- Un dato mal formado es un fallo de CI con un mensaje en español que dice qué
  corregir, no algo que alguien tiene que detectar mirando el mapa.
- La regla de las fuentes convierte el rigor editorial en una condición
  técnica: no se publica nada sin decir de dónde salió.
- El validador no puede comprobar si un hecho es **cierto**. Eso sigue siendo
  trabajo humano, y por eso existe `docs/product/contenido-por-verificar.md`.

## Alternativas descartadas

- **JSON Schema con Ajv.** Más estándar, pero añade dependencia y no expresa
  bien las reglas que de verdad importan aquí (duplicados entre registros,
  caja geográfica, mensajes en español para quien no programa).
- **Validar solo en tiempo de ejecución.** Llega tarde: el dato ya está
  publicado y el usuario ya lo ha visto.
