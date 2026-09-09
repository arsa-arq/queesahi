# Publicar en GitHub y ver la herramienta en línea

Implementa las secciones 11 y 16 de `ARCHITECTURE.md`.

## Los dos problemas, que son distintos

Si subiste archivos y «no pasan las carpetas» y «la herramienta no se
visualiza», son dos cosas separadas y cada una tiene su solución.

### 1. Las carpetas no suben

Casi siempre es porque los archivos se arrastraron a la página de GitHub
(**Add file → Upload files**) en vez de subirse con Git.

Ese formulario sube archivos sueltos. Con una estructura como la de este
proyecto —`src/`, `public/fotos/`, `docs/`, `.github/`— se pierde la jerarquía o
se quedan carpetas por el camino. Además, los archivos que empiezan por punto
(`.gitignore`, `.nojekyll`, `.github/`) no siempre se seleccionan al arrastrar
desde el Explorador de Windows, y son justo los que hacen falta.

**La solución es empujar el repositorio con Git.** Este proyecto ya es un
repositorio con su historial completo; solo le falta saber a dónde enviarlo.

### 2. La herramienta no se ve

Aunque subas todo bien, **un repositorio de GitHub no es un sitio web**. Al
abrir `index.html` en github.com verás el código fuente, no el mapa.

Para verla funcionando hay que activar **GitHub Pages**, que publica el
contenido del repositorio como página web.

---

## Paso 1 — Crear el repositorio en GitHub

En <https://github.com/new>:

- **Repository name:** `que-es-ahi`
- **Public** si quieres que cualquiera pueda verlo; **Private** si de momento no.
- **No marques** «Add a README file», «Add .gitignore» ni «Choose a license».
  El repositorio local ya los tiene, y crearlos allí provoca un conflicto al
  empujar.

Copia la URL que te muestra, del estilo
`https://github.com/tu-usuario/que-es-ahi.git`.

## Paso 2 — Conectar y empujar

En una terminal, dentro de la carpeta del proyecto:

```bash
git remote add origin https://github.com/tu-usuario/que-es-ahi.git
git push -u origin main
```

La primera vez te pedirá autenticarte. Si no tienes configurado el acceso,
la vía más simple es instalar [GitHub CLI](https://cli.github.com) y ejecutar
`gh auth login`; también sirve [GitHub Desktop](https://desktop.github.com).

Con eso sube **todo**: las carpetas, el historial de commits y los archivos que
empiezan por punto.

### Comprobar que subió completo

En la página del repositorio deberías ver, en la raíz: `index.html`, `src/`,
`public/`, `docs/`, `scripts/`, `tests/`, `.github/`. Si falta alguna, casi
seguro es que quedó contenido sin confirmar:

```bash
git status
```

## Paso 3 — Activar GitHub Pages

En el repositorio: **Settings → Pages**.

- **Source:** «Deploy from a branch»
- **Branch:** `main`, carpeta `/ (root)`
- **Save**

En uno o dos minutos la herramienta estará en:

```text
https://tu-usuario.github.io/que-es-ahi/
```

Esa dirección se puede compartir y abrir desde el móvil.

---

## Detalles que evitan sorpresas

**El botón «¿Qué es ahí?» solo funciona en HTTPS.** Los navegadores exigen
contexto seguro para dar la ubicación. GitHub Pages sirve por HTTPS, así que
allí funciona; abriendo el archivo con doble clic también, porque `file://`
cuenta como contexto seguro. Lo que **no** funciona es servirlo por `http://`
desde una IP de la red local: el mapa carga pero la geolocalización falla.

**El sitio cuelga de un subdirectorio** (`/que-es-ahi/`). Todas las rutas del
proyecto son relativas, así que funciona sin cambios. Si alguna vez añades una
ruta que empiece por `/`, se romperá justo ahí y en ningún otro sitio.

**`.nojekyll`** está en la raíz a propósito. Sin él, GitHub Pages procesa el
sitio con Jekyll, que ignora archivos y carpetas que empiezan por guion bajo. No
tenemos ninguna hoy, pero el archivo cuesta cero y evita un fallo difícil de
diagnosticar.

**La carpeta está dentro de OneDrive.** Git funciona, pero si ves errores raros
de archivos bloqueados, pausa la sincronización mientras trabajas. Para un
proyecto que ya vive en GitHub, OneDrive deja de ser necesario como respaldo.

**Nunca subas por la web encima de lo empujado.** Mezclar los dos métodos
descuadra el historial. A partir de aquí, todo por `git push`.

---

## Trabajo diario, después de esto

```bash
git add -A
git commit -m "content: fotografia del Teatro Colon"
git push
```

Cada `push` a `main` vuelve a publicar el sitio automáticamente. La integración
continua (`.github/workflows/ci.yml`) ejecuta el validador, las pruebas y la
verificación de tipos en cada cambio; si algo sale en rojo, el aviso llega a la
pestaña **Actions**.
