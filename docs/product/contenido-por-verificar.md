# Contenido por verificar

Datos publicados que todavía no están confirmados contra una fuente citable.
**Esta lista debería estar vacía.** Mientras no lo esté, es la deuda editorial
del proyecto.

Cuando confirmes un punto: añade la fuente al lugar en
`public/data/places.js`, actualiza su `updatedAt` y borra la fila de aquí, en
el mismo Pull Request.

## Academia Colombiana de Historia

Añadida al mapa el 2026-08-29 con varios datos copiados de otra ficha y sin
fuente institucional. La v0.2 corrigió los defectos mecánicos y redactó el texto
de forma conservadora, pero **el contenido sigue sin verificar**.

| Dato publicado | Qué hay que confirmar |
|---|---|
| Fundada en 1902 | Fecha y nombre con el que se fundó la corporación. |
| Biblioteca organizada hacia 1910 | La ficha original decía «inaugurada oficialmente el 11 de julio de 1910» junto a «fundada en 1902», que se contradecían. Se reconcilió atribuyendo 1910 a la biblioteca. **Es una reconstrucción plausible, no un dato confirmado.** |
| Donación inicial de obras de historia americana | La ficha original mencionaba 2.000 libros donados por Jorge Pombo. El dato se retiró por no poder citarlo. |
| Sede en la Calle 10, La Candelaria | La coordenada (4.598117, −74.077428) cae en la Calle 10 con Carrera 8. Falta confirmar la dirección exacta y si es la sede actual. |
| Fuente citada: «Academia Colombiana de Historia» | Sustituir por una referencia concreta y verificable. |

La ficha original mencionaba además a Fabio Lozano y Lozano como director y el
pasaje Rufino Cuervo como ubicación inicial. Ambos datos se retiraron del texto
publicado por no poder citarlos; se anotan aquí para no perderlos.

**Si en la revisión no se confirman**, la salida correcta es poner el lugar en
`status: "review"`: desaparece del mapa, conserva el trabajo hecho y no
compromete la credibilidad del proyecto. Es un cambio de una palabra en
`places.js`.

## Las siete categorías

El catálogo de `public/data/places.js` está creado y funcionando, pero **su
contenido es provisional en dos frentes**, ambos a la espera de que el equipo de
la Cátedra los confirme:

**Los nombres: resueltos.** Desde el 2026-09-11 son los de la matriz de la
Cátedra —Histórica, Institucional, Poblacional, Territorial, Bienestar,
Civilidad y Capa inusual—, con su capa de ciudad, eje, pregunta orientadora,
qué estudia y evidencia. Ver
[`matriz-de-categorias.md`](matriz-de-categorias.md).

**La adscripción de cada predio: resuelta por el modelo.** Desde el 2026-09-11
un lugar pertenece a una capa si y solo si tiene contenido registrado en ella
(ADR 0006). La asignación arbitraria anterior se descartó. Hoy los seis lugares
tienen la capa Histórica y ninguna otra.

**Pendiente: registrar las otras seis capas.** Es trabajo de contenido, no de
código. La guía de cada capa —pregunta, alcance, evidencia— está en
[`matriz-de-categorias.md`](matriz-de-categorias.md).

**El color de la categoría 7** (`#6F4A7F`, ciruela) tampoco viene del PDF de
marca: la paleta original define cinco acentos más dos azules, y hacía falta un
séptimo tono. Confirmar con quien lleva la identidad antes del piloto público.

## Revisión general pendiente

Los cinco lugares originales citan instituciones (IDPC, Banco de la República,
ICANH, Ministerio de las Culturas) pero no documentos concretos. Antes del
piloto público de la v0.9 conviene sustituir cada mención genérica por una
referencia consultable: publicación, ficha de inventario o página institucional
con fecha de consulta.
