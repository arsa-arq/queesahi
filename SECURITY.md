# Seguridad

Implementa la sección 14 de `ARCHITECTURE.md`.

## Reportar un problema

Escribe a quien coordina el proyecto en la Cátedra Bogotá. No abras un issue
público con los detalles de una vulnerabilidad explotable.

## Secretos

**Nunca** se versionan contraseñas, tokens, *service role keys*, certificados ni
credenciales. `.gitignore` bloquea `.env`, `.env.*`, `*.pem` y `*.key`, pero eso
es una red, no una garantía: la responsabilidad es de quien hace el commit.

Cuando llegue Supabase (v0.6):

- La `anon key` puede ir al frontend; es pública por diseño y su seguridad
  depende de las políticas RLS, que hay que escribir explícitamente.
- La `service_role key` **nunca** llega al navegador, ni siquiera en desarrollo.
- Las variables sensibles van en `.env.local`, en los secretos de GitHub o en la
  configuración del proveedor de hosting.

Si un secreto se filtra a Git, **rótalo primero** y luego limpia el historial.
Un secreto publicado sigue siendo público aunque se borre el commit.

## Datos personales

Hoy la aplicación maneja un solo dato sensible: **la ubicación del usuario**.

- Se pide solo cuando la persona pulsa «¿Qué es ahí?», nunca al cargar.
- No sale del dispositivo: no se envía a ningún servidor ni a analítica.
- La última posición se guarda en `localStorage` para responder cuando el GPS
  falla, y `forgetLastKnownPosition()` la borra.

Esto no debería cambiar sin una decisión documentada. Si alguna versión futura
necesita enviar la posición a un servidor, requiere ADR y aviso explícito al
usuario.

## Contenido y XSS

Las fichas se construyen con `innerHTML`. Todo dato pasa por el escapado de
`src/utils/html.js`; usar `raw()` sobre un dato es motivo de rechazo en la
revisión. Ver [ADR 0003](docs/adr/0003-escapado-html-en-las-fichas.md).

Esto importará mucho más en la v0.7, cuando el texto lo escriban varias personas
desde un panel de edición.

## Dependencias de terceros

Leaflet se carga desde un CDN con `integrity` y `crossorigin`: si el archivo
cambia, el navegador lo rechaza. Aun así, depender de un tercero para el
arranque es deuda; el ROADMAP la salda en la v0.4 sirviendo la librería desde el
propio dominio.

No se añaden dependencias de ejecución sin justificarlo en el PR.

## Enlaces salientes

Los enlaces a Google Maps y OpenStreetMap llevan `rel="noopener noreferrer"` y
`target="_blank"`. `safeUrl()` solo admite `http:` y `https:`.
