# Cómo contribuir

Implementa las secciones 11, 12 y 13 de `ARCHITECTURE.md`. La fuente oficial de
verdad es GitHub: lo que no está en el repositorio, no cuenta.

## Antes de empezar

Lee [`AGENTS.md`](AGENTS.md). Tiene las reglas que no se negocian y el mapa de
dónde va cada cosa.

## Ramas

```text
main      estable, desplegable en cualquier momento
develop   integración
```

De trabajo, siempre a partir de `develop`:

```text
feature/*   nueva funcionalidad     feature/busqueda-por-categoria
fix/*       corrección              fix/permiso-de-ubicacion
refactor/*  cambio interno          refactor/repositorio-indexeddb
docs/*      documentación           docs/adr-supabase
test/*      pruebas                 test/e2e-ficha
chore/*     mantenimiento           chore/actualizar-leaflet
```

Para contenido usamos `feature/lugar-<slug>`, por ejemplo
`feature/lugar-casa-de-narino`.

## Commits

Mensajes en español, en imperativo y explicando el **porqué** cuando no sea
obvio. Prefijo tipo Conventional Commits para que el CHANGELOG salga solo:

```text
fix: corregir el color de la Academia Colombiana de Historia

El valor «#7C8B4A;» era aceptado dentro del atributo style del marcador
pero setProperty() lo descartaba, así que la ficha salía azul. Se añade
isHexColor() y el validador lo rechaza.
```

Tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `content`.

## Pull Requests

Cada PR debe traer:

1. **Qué cambia y por qué.** Si es estructural, enlace al ADR.
2. **Cómo se comprobó.** Comandos ejecutados y qué se miró en el navegador.
3. **`npm run check` en verde.** La CI lo repite, pero no la uses de linter.
   Y ábrelo con doble clic: es el modo en que lo usa el equipo.
4. **`CHANGELOG.md` actualizado**, salvo en cambios internos sin efecto visible.
5. **Captura de pantalla** si cambia algo que se ve.

La CI ejecuta, en este orden y sobre Node 20 y 22:

```text
validate → test → typecheck
```

Si algo falla, el cambio no se integra (sección 13).

## Contenido

El contenido tiene los mismos requisitos que el código, y uno más: **la
verificación**.

- Ningún lugar se publica sin al menos una fuente en `sources`. El validador lo
  exige.
- Si un dato no está confirmado, el lugar va en `status: "review"` —no aparece
  en el mapa— y se anota en `docs/product/contenido-por-verificar.md`.
- Preferimos fuentes institucionales: IDPC, Banco de la República, ICANH,
  Ministerio de las Culturas, la propia institución.
- Ante la duda entre un dato llamativo sin confirmar y ninguno, va ninguno. El
  producto se sostiene sobre su credibilidad.

Los criterios de redacción están en `docs/product/criterios-editoriales.md`.

## Estructura y ADR

No se aceptan cambios estructurales sin documentación previa (sección 11). Si
tu cambio afecta al stack, a las capas, al modelo de datos o a la seguridad,
abre primero un ADR en `docs/adr/` siguiendo el formato de los existentes.

## Estilo

- `.editorconfig` fija el formato: UTF-8, LF, dos espacios, sin espacios al
  final.
- Comentarios y nombres de dominio en español; palabras clave de JavaScript en
  inglés, obviamente.
- Un comentario explica **por qué**, no **qué**. El qué ya está en el código.
