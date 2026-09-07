# ADR 0001 — Usar ADR para registrar las decisiones de arquitectura

- **Fecha:** 2026-09-05
- **Estado:** aceptada

## Contexto

La sección 20 de `ARCHITECTURE.md` exige documentar toda decisión estructural, y
la 18 establece que la continuidad del proyecto no puede depender de la memoria
de una conversación ni de una herramienta concreta.

El primer diagnóstico de la carpeta encontró justamente eso: un prototipo que
funcionaba, pero sin repositorio Git, sin historial y sin ningún registro de por
qué el código estaba escrito así. Toda la justificación vivía en la
conversación que lo produjo. Cualquier agente o persona que llegara después
tendría que deducirla leyendo, o —más probable— rehacer el trabajo.

## Decisión

Cada decisión que afecte a la estructura, al stack, a la seguridad o al modelo
de datos se registra como un archivo en `docs/adr/`, numerado y en orden
cronológico, con este formato: contexto, decisión, consecuencias, alternativas
descartadas.

Un ADR no se edita para cambiar de opinión: se escribe uno nuevo que lo
sustituye, y el antiguo pasa a estado «sustituida por ADR NNNN». El historial de
las decisiones importa tanto como la decisión vigente.

## Consecuencias

- Un agente de IA o una persona nueva puede reconstruir el porqué del código
  leyendo `README.md`, `AGENTS.md`, `ARCHITECTURE.md`, `ROADMAP.md` y este
  directorio, tal y como pide la sección 18.
- Las revisiones dejan de discutir decisiones ya tomadas.
- Cuesta unos minutos por decisión. Es el precio de no repetir la discusión.

## Alternativas descartadas

- **Comentarios en el código.** Explican el «cómo», no el «por qué se descartó
  lo otro», y desaparecen con el refactor que los invalida.
- **Issues de GitHub.** Sirven para el trabajo en curso, no como memoria
  estable: se cierran, se archivan y nadie los relee.
