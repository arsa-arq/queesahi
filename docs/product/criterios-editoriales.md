# Criterios editoriales

El producto de «¿Qué es ahí?» no es el mapa: es el texto. El mapa solo decide
cuándo mostrarlo.

## A quién le hablamos

A alguien que está **de pie, en la calle, mirando el lugar**, con el teléfono en
la mano y poco tiempo. No a un lector de enciclopedia. Todo lo que escribimos
compite con lo que esa persona tiene delante.

De ahí salen tres consecuencias:

1. Lo primero tiene que servir de inmediato. Si solo lee el resumen, ya debe
   haber ganado algo.
2. Preferimos lo que se puede **ver desde donde está** a lo que solo se puede
   saber.
3. Frases cortas. Un párrafo que no se entiende de una pasada está mal escrito.

## Los campos de una ficha

| Campo | Qué es | Extensión |
|---|---|---|
| `summary` | Una frase que responde «¿qué es esto?». | 1 frase |
| `description` | Qué es el lugar, en concreto: qué hay, qué se ve, qué lo rodea. | 2–4 frases |
| `whyItMatters` | Por qué merece detenerse. La razón, no el adjetivo. | 2–3 frases |
| `lookCloser` | Qué mirar **ahora mismo, desde ahí**. El campo más valioso. | 1–3 frases |
| `historicalContext` | Cómo llegó a ser lo que es. Fechas verificables. | 2–3 frases |
| `curiosity` | Un dato que se pueda contar a alguien esa misma tarde. | 1–2 frases |

Un campo vacío se omite; la ficha no lo muestra. Es mejor omitirlo que rellenarlo.

## Reglas

- **Nada sin fuente.** `status: "published"` exige al menos una entrada en
  `sources`, y el validador lo comprueba.
- **Ante la duda, se retira el dato.** Un dato llamativo sin confirmar vale
  menos que ninguno: el producto se sostiene sobre su credibilidad.
- **Distinguir hecho de tradición.** «La tradición sostiene que aquí Jiménez de
  Quesada fundó Santa Fe» no es lo mismo que «aquí se fundó Santa Fe». Esa
  diferencia es contenido, no cautela.
- **Cifras redondeadas y honestas.** «Unas 34.000 piezas», «cerca de 1.500
  escalones».
- **Sin superlativos de folleto.** «Impresionante», «mágico» y «joya
  imperdible» no informan. Si algo es notable, dilo con el hecho que lo hace
  notable.
- **Español de Colombia**, con tildes y comillas angulares («»).
- **No dar por hecho el conocimiento previo.** Muisca, tumbaga o poporo se
  explican en la frase misma.

## Cómo lo revisamos

Antes de publicar un lugar:

1. ¿Se entiende leyéndolo de pie, en treinta segundos?
2. ¿`lookCloser` señala algo que de verdad se ve desde ahí?
3. ¿Cada fecha y cada cifra están en la fuente citada?
4. ¿Sobra algún adjetivo?
5. `npm run check` en verde.
