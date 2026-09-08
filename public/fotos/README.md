# Fotografías de los lugares

Una imagen por lugar. Se muestra fija en la parte superior de la ficha, y el
texto se desliza por debajo al desplazarse.

## Estado actual

Las imágenes que hay aquí son **marcadores de posición**, no fotografías: un
fondo con el color de acento del lugar, su emoji y la palabra «Fotografía
pendiente». Están para que la ficha se pueda ver y probar mientras se consiguen
las fotos de verdad, y son deliberadamente inconfundibles para que nadie las dé
por buenas en una demostración.

Las genera `npm run fotos:placeholders`. Ese script **nunca sobrescribe una
fotografía real**: reconoce sus propios archivos por una marca interna y respeta
todo lo demás.

## Cómo poner una fotografía de verdad

1. Guarda la imagen aquí con el `slug` del lugar como nombre:
   `plaza-de-bolivar.jpg`.
2. Abre `public/data/places.js`, busca ese lugar y cambia la extensión en
   `images[0].src`, de `.svg` a `.jpg`.
3. Escribe un `alt` que describa lo que se ve, no el nombre del lugar. Es
   obligatorio: `npm run validate` falla si falta.
4. Rellena `credit` con autoría y licencia.
5. Borra el marcador de posición `plaza-de-bolivar.svg`.
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

**Tamaño.** Alrededor de 1200 × 630 px. La ficha recorta al centro, así que lo
importante debe quedar hacia el medio.

**Encuadre.** Horizontal. La franja inferior queda cubierta por un degradado
oscuro y el nombre del lugar; no pongas ahí nada que importe.

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
