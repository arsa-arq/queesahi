# Matriz de categorías

Las siete capas desde las que se lee un predio. Vienen de
`Matriz_Que es ahi.xlsx`, entregada por el equipo de la Cátedra el 2026-09-11,
y están cargadas en el catálogo de `public/data/places.js`.

Este documento es la fuente para escribir la ficha de un predio: la **pregunta
orientadora** dice qué buscar, **qué estudia** delimita el alcance y la
**evidencia** describe qué debe quedar como resultado.

> **Ojo con la naturaleza de estas categorías.** No son tipos de predio
> excluyentes —un edificio no «es» histórico *o* poblacional—, sino **capas de
> lectura**: preguntas distintas que se le pueden hacer al mismo lugar. La Plaza
> de Bolívar admite las siete. Eso tiene una consecuencia práctica sobre cómo se
> clasifica cada predio, anotada al final.

---

## 1. Histórica

**Capa de ciudad:** Histórico-memorial.
**Eje de Cátedra Bogotá:** ¿Cómo conocemos? — Complejidad y civilidad
**Color:** `#C74A2C`

> ¿Qué hechos, memorias, usos anteriores y transformaciones explican este lugar?

**Qué estudia.** Reconstruye la trayectoria histórica del predio, fachada, calle, institución o espacio urbano. Integra archivos, imágenes antiguas, relatos, nombres, fechas y cambios de uso.

**Evidencia o producto.** Línea del tiempo, reseña histórica, fuentes consultadas, comparación antes/ahora y relato de memoria urbana.

## 2. Institucional

**Capa de ciudad:** Institucional y normativa.
**Eje de Cátedra Bogotá:** ¿Cómo nos organizamos? — Marco institucional y participación
**Color:** `#E0951E`

> ¿Qué institución, poder, norma, decisión pública o función ciudadana se expresa en este lugar?

**Qué estudia.** Identifica entidades, funciones públicas, decisiones urbanas, símbolos de poder, normas, administración distrital, justicia, gobierno, participación o vida democrática vinculada al espacio.

**Evidencia o producto.** Ficha institucional, identificación de entidad o actor, función pública del lugar y lectura de su relación con Bogotá.

## 3. Poblacional

**Capa de ciudad:** Poblacional y de actores sociales.
**Eje de Cátedra Bogotá:** ¿Cuántos y quiénes somos? — Componente poblacional
**Color:** `#7C8B4A`

> ¿Quiénes usan, transitan, habitan, recuerdan, trabajan, disputan o significan este espacio?

**Qué estudia.** Reconoce los sujetos que dan vida al lugar: estudiantes, trabajadores, comerciantes, funcionarios, turistas, manifestantes, familias, habitantes, transeúntes y comunidades diversas.

**Evidencia o producto.** Entrevistas, testimonios, observación de usuarios, voces ciudadanas y caracterización básica de actores.

## 4. Territorial

**Capa de ciudad:** Territorial, cartográfica y de uso del suelo.
**Eje de Cátedra Bogotá:** ¿Dónde habitamos? — Componente territorial
**Color:** `#3C5393`

> ¿Dónde se ubica este lugar, cómo se relaciona con su entorno y cómo ha cambiado el suelo que ocupa?

**Qué estudia.** Analiza ubicación, predio, manzana, calles, carreras, recorridos, accesos, cambios de uso del suelo, relación con la Plaza de Bolívar, mapas antiguos y actuales.

**Evidencia o producto.** Mapa, croquis, coordenada, comparación cartográfica, fotografía del entorno y ficha territorial.

## 5. Bienestar

**Capa de ciudad:** Bienestar, espacio público y vida cotidiana.
**Eje de Cátedra Bogotá:** ¿Cómo vivimos? — Infraestructura, bienestar y espacio público
**Color:** `#05707F`

> ¿Qué aporta o limita este lugar para la vida colectiva, la convivencia, la movilidad, la permanencia y el cuidado?

**Qué estudia.** Estudia accesibilidad, seguridad, permanencia, circulación, encuentro ciudadano, cuidado, deterioro, usos cotidianos, conflictos, convivencia y apropiación del espacio común.

**Evidencia o producto.** Registro fotográfico, observación de campo, lectura de usos ciudadanos, evidencias de cuidado o deterioro y recomendación pedagógica.

## 6. Civilidad

**Capa de ciudad:** Prospectiva, patrimonial y de civilidad.
**Eje de Cátedra Bogotá:** ¿Cómo nos proyectamos? — Modelos de ciudad y memoria
**Color:** `#04437F`

> ¿Qué debemos conservar, valorar, transformar o cuidar de este lugar para la Bogotá del futuro?

**Qué estudia.** Integra la lectura patrimonial, arquitectónica, simbólica y ciudadana del espacio. Permite que los estudiantes formulen compromisos de cuidado y reflexionen sobre el modelo de ciudad que desean construir.

**Evidencia o producto.** Compromiso ciudadano, mensaje de cuidado, propuesta juvenil, ficha de civilidad

## 7. Capa inusual

**Capa de ciudad:** Inusual
**Eje de Cátedra Bogotá:** ¿Qué define el espacio?
**Color:** `#6F4A7F`

> ¿Qué no vemos?, ¿Qué pasa desapercibido a nuestras vistas? ¿Que hemos considerado no importante?

**Qué estudia.** Reconoce elementos, que siempre están, pero no tenemos en cuenta, el olor, los diseños, el uso, el ruido,

**Evidencia o producto.** Registro fotográfico, sonoro, colecciones

---

## Cómo registrar una capa en un lugar

Decidido el 2026-09-11: **cada lugar registra contenido en una, varias o las
siete capas** (ver [ADR 0006](../adr/0006-capas-de-lectura-con-contenido-propio.md)).

En `public/data/places.js`, dentro del lugar:

```js
"layers": {
  "categoria-2": {
    "text": "Responde a la pregunta orientadora de la capa Institucional.",
    "evidence": ["Ficha institucional", "Función pública del lugar"],
    "sources": ["Concejo de Bogotá"]
  }
}
```

- **`text`** es obligatorio y responde a la *pregunta orientadora* de la capa.
- **`evidence`** es opcional: los productos de la columna «Evidencia o
  producto» que se hayan elaborado.
- **`sources`** es opcional: las fuentes que sostienen *esta* lectura. Las
  generales del lugar siguen en su campo `sources`.
- La clave es el id de la capa: `categoria-1` Histórica … `categoria-7` Capa
  inusual.

Un lugar pertenece a una capa **solo si tiene texto en ella**. Si todavía no hay
nada que decir desde una capa, no se pone: una capa vacía no cuenta y el
validador la rechaza.

## Estado del registro

Los seis lugares tienen registrada la capa **Histórica**: su antiguo campo de
contexto histórico, que responde sin ambigüedad a su pregunta. Ninguno tiene
todavía las otras seis. El resto del texto de cada ficha —descripción, por qué
importa, míralo de cerca, curiosidad— sigue como presentación general del lugar;
parte de él podría redistribuirse entre capas, y eso es trabajo editorial.
