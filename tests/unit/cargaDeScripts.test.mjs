/**
 * Protege lo más frágil del diseño sin módulos: el orden de carga.
 *
 * Con scripts clásicos, el orden de los `<script>` de `index.html` *es* el
 * grafo de dependencias. Un archivo nuevo colocado en el sitio equivocado
 * rompe la aplicación al arrancar, y solo se nota abriéndola. Estas pruebas
 * convierten ese fallo en un test en rojo.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { QEA } from "../helpers/loadApp.mjs";

const ROOT = new URL("../../", import.meta.url);
const indexHtml = await readFile(new URL("index.html", ROOT), "utf8");

/**
 * Rutas locales de los <script src="..."> de index.html, en orden.
 * Se quita el sello `?v=x.y.z` que añade `npm run version:sync`.
 */
const scriptOrder = [...indexHtml.matchAll(/<script\s+src="([^"]+)"/g)]
  .map((match) => match[1].split("?")[0])
  .filter((src) => !src.startsWith("http"));

test("index.html carga namespace.js antes que cualquier otro archivo propio", () => {
  assert.equal(
    scriptOrder[0],
    "src/app/namespace.js",
    "namespace.js define QEA.require: nada puede cargarse antes"
  );
});

test("index.html carga los datos antes que los repositorios", () => {
  const datos = scriptOrder.indexOf("public/data/places.js");
  const repositorio = scriptOrder.indexOf("src/repositories/embeddedPlaceRepository.js");
  assert.ok(datos !== -1, "falta el <script> de public/data/places.js");
  assert.ok(datos < repositorio, "los datos deben cargarse antes que el repositorio que los lee");
});

test("index.html carga main.js el último", () => {
  assert.equal(
    scriptOrder[scriptOrder.length - 1],
    "src/app/main.js",
    "main.js conecta todas las capas: va al final"
  );
});

test("cada dependencia declarada en la cabecera se carga antes que el archivo", async () => {
  // Cada archivo documenta sus dependencias en una línea «Depende de:».
  // Aquí se comprueba que esa declaración concuerde con el orden real.
  for (const src of scriptOrder) {
    if (src.startsWith("public/")) continue;
    const source = await readFile(new URL(src, ROOT), "utf8");
    const declared = source.match(/Depende de:\s*([\s\S]*?)\n \*\s*(?:\n|\/)/);
    if (!declared) continue;

    const deps = declared[1]
      .replace(/\n \*/g, " ")
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.endsWith(".js"));

    for (const dep of deps) {
      const depPath = `src/${dep}`;
      assert.ok(
        scriptOrder.indexOf(depPath) < scriptOrder.indexOf(src),
        `${src} declara depender de ${dep}, pero index.html lo carga después`
      );
    }
  }
});

test("QEA.require falla con un mensaje útil si algo no está cargado", () => {
  assert.throws(
    () => QEA.require("moduloQueNoExiste"),
    /no está cargado todavía.*index\.html/s
  );
});

test("todos los módulos esperados quedan registrados", () => {
  for (const name of [
    "types",
    "html",
    "config",
    "geoService",
    "locationService",
    "placeRepository",
    "embeddedPlaceRepository",
    "inMemoryPlaceRepository"
  ]) {
    assert.ok(QEA[name], `falta registrar «${name}»`);
  }
});

// --- Sello de versión contra la caché -------------------------------------

test("todos los archivos locales llevan el sello de la versión actual", async () => {
  // GitHub Pages sirve con Cache-Control: max-age=600. Sin este sello, tras
  // publicar una versión un visitante puede recibir el index.html nuevo con el
  // CSS y el JS viejos: no la versión anterior, sino un híbrido roto. Pasó de
  // verdad. Ver scripts/sync-version.mjs.
  const { version } = JSON.parse(await readFile(new URL("package.json", ROOT), "utf8"));

  const locales = [...indexHtml.matchAll(/\s(?:src|href)="((?!https?:)[^"]+\.(?:js|css)[^"]*)"/g)].map(
    (m) => m[1]
  );

  assert.ok(locales.length > 0, "no se encontró ningún archivo local en index.html");

  for (const ruta of locales) {
    assert.ok(
      ruta.endsWith(`?v=${version}`),
      `«${ruta}» no lleva el sello ?v=${version}. Ejecuta: npm run version:sync`
    );
  }
});

test("los archivos de CDN no llevan sello", () => {
  // Su URL ya incluye la versión de la librería, y añadir un parámetro
  // invalidaría la comprobación de integridad del navegador.
  const cdn = [...indexHtml.matchAll(/\s(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  for (const url of cdn) {
    assert.ok(!url.includes("?v="), `${url} no debería llevar sello de versión`);
  }
});
