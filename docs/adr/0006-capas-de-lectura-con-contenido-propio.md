# ADR 0006 — Cada lugar registra contenido propio en una, varias o las siete capas

- **Fecha:** 2026-09-11
- **Estado:** aceptada

## Contexto

La 0.3.0 introdujo siete categorías y la 0.3.2 les dio nombre desde la matriz de
la Cátedra: Histórica, Institucional, Poblacional, Territorial, Bienestar,
Civilidad y Capa inusual.

Al leer la matriz quedó claro que no son tipos de predio excluyentes sino
**capas de lectura**: preguntas distintas que se le hacen al mismo lugar. La
coordinación del proyecto lo confirmó y fijó el enfoque:

> «Para cada lugar se tenga la opción de registrar lo relacionado a una o las
> siete capas; en un mismo lugar se pueden presentar todas, algunas o solo una.»

El modelo de la 0.3.x no permitía eso. Cada lugar tenía:

- campos editoriales genéricos (`description`, `historicalContext`, …), y
- una lista `categoryIds` de pertenencia **sin contenido detrás**.

Declarar que un lugar pertenece a la capa Institucional no decía *qué* se
registró desde esa capa. Y la asignación que había —un lugar por categoría,
repartida para conservar colores— era arbitraria, como documentaba
`contenido-por-verificar.md`.

## Decisión

Cada lugar lleva un campo `layers`: un objeto cuya clave es el id de la capa y
cuyo valor es lo registrado desde ella.

```js
"layers": {
  "categoria-1": {
    "text": "Lo que responde a la pregunta orientadora de la capa.",
    "evidence": ["Línea del tiempo", "Comparación antes/ahora"],
    "sources": ["Archivo de Bogotá"]
  },
  "categoria-3": { "text": "…" }
}
```

- **`text` es obligatorio**; `evidence` y `sources` son opcionales.
- **Un lugar pertenece a una capa si y solo si tiene contenido registrado en
  ella.** No hay una lista de pertenencia aparte que pueda desincronizarse del
  contenido: la pertenencia *es* el contenido.
- Un lugar publicado debe tener **al menos una** capa.
- El orden de presentación lo da el catálogo, no el objeto.

El campo `categoryIds` desaparece de los datos. `categoryService` lo sigue
leyendo como respaldo para no romper documentos antiguos.

### Migración

`historicalContext` de los seis lugares respondía, sin ambigüedad, a la pregunta
de la capa Histórica («¿Qué hechos, memorias, usos anteriores y
transformaciones explican este lugar?»). Pasa íntegro a `layers["categoria-1"]`.

La asignación arbitraria de la 0.3.x se **descarta**: no tenía contenido que la
sostuviera. Tras la migración los seis lugares tienen una capa registrada —la
Histórica—, que es exactamente lo que el contenido existente permite afirmar.

El resto de campos genéricos (`summary`, `description`, `whyItMatters`,
`lookCloser`, `curiosity`) se quedan como presentación general del lugar.
Redistribuir su texto entre capas es trabajo editorial, no técnico.

### El marcador del mapa

Con varias capas por lugar, «el color de su categoría» deja de tener sentido.
El marcador pasa a llevar un **anillo segmentado**: un tramo del color de cada
capa registrada, en el orden del catálogo.

- Con una capa, el anillo es de un solo color: idéntico al marcador de antes.
- Con varias, se ve de un vistazo desde qué capas se ha leído el lugar.
- Sin ninguna, el azul de marca.

## Consecuencias

- Tras la migración **los seis marcadores son rojos**, porque todos tienen solo
  la capa Histórica. No es una regresión: es lo que el contenido registrado
  permite afirmar hoy. A medida que se registren otras capas, los anillos se
  irán llenando de color.
- Filtrar por cualquier capa distinta de la Histórica devuelve cero lugares
  hasta que alguien registre contenido en ella. El menú lo muestra atenuado.
- La ficha gana una sección «Capas de lectura» con cada capa registrada, su
  pregunta orientadora y su contenido, y unos accesos rápidos arriba para
  saltar a cada una.
- Un lugar ya no puede «estar» en una capa sin haber dicho nada desde ella. El
  validador lo impide.
- `schemaVersion` pasa a 3.

## Alternativas descartadas

- **Mantener `categoryIds` y añadir `layers` al lado.** Dos fuentes de verdad
  sobre lo mismo: tarde o temprano un lugar figuraría en una capa sin contenido,
  o tendría contenido en una capa que no declara.
- **Un arreglo de capas en vez de un objeto.** Permite registrar dos veces la
  misma capa por error y obliga a buscar para leer una. Con el objeto, la clave
  garantiza unicidad y el acceso es directo.
- **Conservar la asignación arbitraria como capas vacías.** Contradice el
  enfoque: una capa existe cuando se registra algo desde ella.
- **Color del marcador = el de la primera capa.** Arbitrario en cuanto un lugar
  tiene dos, y oculta justo la información que el enfoque quiere hacer visible.
