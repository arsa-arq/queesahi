import test from "node:test";
import assert from "node:assert/strict";

import { html as htmlModule } from "../helpers/loadApp.mjs";

const { escapeHtml, html, isHexColor, raw, safeUrl, toHtmlString } = htmlModule;

test("escapeHtml: neutraliza los caracteres con significado en HTML", () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  assert.equal(escapeHtml("Tom & Jerry"), "Tom &amp; Jerry");
  assert.equal(escapeHtml("l'histoire"), "l&#39;histoire");
});

test("escapeHtml: null y undefined se vuelven cadena vacía", () => {
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
});

test("escapeHtml: conserva las tildes y la puntuación española", () => {
  assert.equal(escapeHtml("¿Qué es ahí? «Bogotá»"), "¿Qué es ahí? «Bogotá»");
});

test("html: escapa las interpolaciones pero no la plantilla", () => {
  const nombre = '<img src=x onerror="alert(1)">';
  const result = toHtmlString(html`<h2>${nombre}</h2>`);
  assert.ok(result.startsWith("<h2>"), "las etiquetas de la plantilla se conservan");
  assert.ok(!result.includes("<img"), "el dato inyectado queda escapado");
  assert.ok(result.includes("&lt;img"));
});

test("html: los fragmentos anidados no se escapan dos veces", () => {
  const inner = html`<b>${"a & b"}</b>`;
  assert.equal(toHtmlString(html`<p>${inner}</p>`), "<p><b>a &amp; b</b></p>");
});

test("html: los arreglos se concatenan y cada elemento se escapa", () => {
  const chips = ["Historia", "<b>Arte</b>"].map((c) => html`<span>${c}</span>`);
  assert.equal(
    toHtmlString(html`<div>${chips}</div>`),
    "<div><span>Historia</span><span>&lt;b&gt;Arte&lt;/b&gt;</span></div>"
  );
});

test("html: los valores vacíos permiten condicionales sin imprimir nada", () => {
  assert.equal(toHtmlString(html`<p>${null}${undefined}${false}</p>`), "<p></p>");
});

test("raw: deja pasar HTML construido por el propio código", () => {
  assert.equal(toHtmlString(html`<p>${raw("<br>")}</p>`), "<p><br></p>");
});

test("safeUrl: acepta http y https, rechaza el resto", () => {
  assert.equal(safeUrl("https://www.openstreetmap.org/"), "https://www.openstreetmap.org/");
  assert.equal(safeUrl("http://ejemplo.co"), "http://ejemplo.co");
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("data:text/html,<script>"), "");
  assert.equal(safeUrl(undefined), "");
});

test("isHexColor: rechaza el color que rompía la ficha", () => {
  // Este era el defecto real: «#7C8B4A;» funcionaba dentro de un atributo
  // style y era descartado en silencio por setProperty().
  assert.equal(isHexColor("#7C8B4A;"), false);
  assert.equal(isHexColor("#7C8B4A"), true);
  assert.equal(isHexColor("#04437f"), true);
  assert.equal(isHexColor("#FFF"), false);
  assert.equal(isHexColor("rojo"), false);
  assert.equal(isHexColor(undefined), false);
});
