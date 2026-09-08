# Fotografías de los lugares

Una imagen por lugar. Se muestra fija en la parte superior de la ficha, y el
texto se desliza por debajo al desplazarse.

## Estado actual

Las imágenes que hay aquí son **marcadores de posición**, no fotografías: un
fondo con el color de acento del lugar, su emoji y la palabra «Fotografía
pendiente». Están para que la ficha se pueda ver y probar mientras se consiguen
las fotos de verdad, y son deliberadamente inconfundibles para que nadie las dé
por buenas en una demostración.

Son PNG y pesan unos 25 kB cada uno. Se ven en la miniatura del Explorador de
Windows, en la vista previa y en cualquier visor, igual que se verán las
fotografías reales.

Las genera `npm run fotos:placeholders`, que las dibuja con el navegador que
tengas instalado (Chrome o Edge). Ese script **nunca sobrescribe una fotografía
real**: solo toca los archivos que él mismo anotó en `.marcadores.json`, y
respeta todo lo demás.

No hace falta ejecutarlo para ver la herramienta: los PNG están versionados.

## Cómo poner una fotografía de verdad

1. Guarda la imagen aquí con el `slug` del lugar como nombre:
   `plaza-de-bolivar.jpg`.
2. Abre `public/data/places.js`, busca ese lugar y cambia la extensión en
   `images[0].src`, de `.png` a `.jpg`.
3. Escribe un `alt` que describa lo que se ve, no el nombre del lugar. Es
   obligatorio: `npm run validate` falla si falta.
4. Rellena `credit` con autoría y licencia.
5. Borra el marcador de posición `plaza-de-bolivar.png` y quita su nombre de
   `.marcadores.json`.
6. `npm run check`.

Ejemplo de la entrada resultante:

```js
"images": [
  {
    "src": "public/fotos/plaza-de-bolivar.jpg",
    "alt": "La Plaza de Bolívar vista desde el costado del Capitolio, con la Catedral Primada al fondo y palomas sobre el piso duro.",
    "credit": "Fotografía de Nombre Apellido, CC BY-SA 4.0"
  }
]
```

## Requisitos

**Formato y peso.** JPG para fotografías, PNG solo si hace falta transparencia.
Menos de 300 kB por imagen: la herramienta se usa en la calle, con datos
móviles.

**Tamaño.** **1600 × 840 px** es el objetivo. Mínimo aceptable: 1200 × 630.

Ese número sale de medir la ficha en pantalla, no de una convención. El
encabezado mide siempre 210 px de alto en CSS, pero su ancho depende del
dispositivo, y las pantallas modernas piden dos o tres píxeles reales por cada
píxel CSS:

| Dispositivo | Caja en pantalla | Proporción | Píxeles reales |
|---|---|---|---|
| Móvil 390 px | 390 × 210 | 1.86 : 1 | 780 × 420 |
| Móvil grande 430 px | 430 × 210 | 2.05 : 1 | 1290 × 630 |
| Tablet 768 px | 768 × 210 | 3.66 : 1 | 1536 × 420 |
| Escritorio | 400 × 210 | 1.90 : 1 | 800 × 420 |
| Pantalla baja | 400 × 150 | 2.67 : 1 | 800 × 300 |

El caso más exigente en ancho es la tablet (1536 px) y el más exigente en alto
el móvil grande (630 px). Con 1600 × 840 se cubren todos sin que el navegador
tenga que ampliar la imagen.

No hace falta que sea exacto: cualquier foto horizontal grande sirve, mientras
se respete el encuadre de abajo.

**Encuadre.** Horizontal, y esta es la parte que de verdad importa.

La imagen se recorta al centro (`object-fit: cover`) y la proporción cambia
entre **1.86 : 1 y 3.66 : 1** según el dispositivo. En una tablet el recorte es
muy panorámico: solo sobrevive una franja horizontal del centro.

- Deja el motivo principal **en la banda central**, tanto en horizontal como en
  vertical.
- La franja inferior —cerca de un tercio— queda bajo un degradado oscuro con el
  nombre del lugar encima. No pongas ahí nada que importe.
- Evita composiciones altas: una torre encuadrada en vertical se decapita.

**Derechos.** Este es el punto que no se negocia. Solo entran aquí:

- fotografías propias del equipo de la Cátedra;
- imágenes con licencia libre que permita uso y atribución (Creative Commons,
  dominio público);
- material cedido por la institución del lugar, con permiso por escrito.

**No se descargan imágenes de internet sin verificar su licencia.** Un proyecto
que se apoya en el patrimonio de la ciudad no puede publicarse infringiendo
derechos de autor. Toda imagen lleva su `credit`, igual que todo lugar lleva su
`sources`.

## Si falta la imagen

Si el archivo no existe o no carga, la ficha no se rompe: muestra el encabezado
con el degradado de marca y el emoji del lugar, como antes de que existieran las
fotografías. `npm run validate` avisa de las referencias a archivos que no están.
