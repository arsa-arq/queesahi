import test from "node:test";
import assert from "node:assert/strict";

import { geoService } from "../helpers/loadApp.mjs";

const { distanceMeters, formatDistance, nearest, sortByDistance, within } = geoService;

/** Plaza de Bolívar y Museo del Oro: unos 470 m en línea recta. */
const PLAZA = { latitude: 4.59808, longitude: -74.07605 };
const MUSEO = { latitude: 4.60193, longitude: -74.07216 };
const MONSERRATE = { latitude: 4.6057, longitude: -74.0562 };

test("distanceMeters: un punto consigo mismo da cero", () => {
  assert.equal(distanceMeters(PLAZA, PLAZA), 0);
});

test("distanceMeters: distancia conocida del centro histórico", () => {
  const meters = distanceMeters(PLAZA, MUSEO);
  assert.ok(meters > 500 && meters < 620, `esperaba ~590 m, obtuve ${meters}`);
});

test("distanceMeters: es simétrica", () => {
  assert.equal(distanceMeters(PLAZA, MONSERRATE), distanceMeters(MONSERRATE, PLAZA));
});

test("distanceMeters: un grado de latitud son unos 111 km", () => {
  const meters = distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 });
  assert.ok(Math.abs(meters - 111195) < 100, `obtuve ${meters}`);
});

test("distanceMeters: soporta puntos antipodales sin devolver NaN", () => {
  // Math.sqrt de un valor ligeramente mayor que 1 por error de coma flotante
  // haría que Math.asin devolviera NaN; por eso la implementación acota.
  const meters = distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 180 });
  assert.ok(Number.isFinite(meters), "la distancia debe ser finita");
});

test("formatDistance: redondea a decenas por debajo del kilómetro", () => {
  assert.equal(formatDistance(0), "0 m");
  assert.equal(formatDistance(47), "50 m");
  assert.equal(formatDistance(994), "990 m");
});

test("formatDistance: usa kilómetros a partir de mil metros", () => {
  assert.equal(formatDistance(1000), "1.0 km");
  assert.equal(formatDistance(2540), "2.5 km");
  assert.equal(formatDistance(15000), "15 km");
});

test("formatDistance: valores inválidos no rompen la interfaz", () => {
  assert.equal(formatDistance(Number.NaN), "—");
  assert.equal(formatDistance(-5), "—");
});

const PLACES = [
  { id: "plaza", ...PLAZA },
  { id: "museo", ...MUSEO },
  { id: "monserrate", ...MONSERRATE }
];

test("nearest: encuentra el lugar más cercano", () => {
  const result = nearest({ latitude: 4.5981, longitude: -74.076 }, PLACES);
  assert.equal(result.place.id, "plaza");
  assert.ok(result.distance < 50);
});

test("nearest: devuelve null si no hay lugares", () => {
  assert.equal(nearest(PLAZA, []), null);
});

test("sortByDistance: ordena de cerca a lejos sin mutar la entrada", () => {
  const original = [...PLACES];
  const sorted = sortByDistance(PLAZA, PLACES);
  assert.deepEqual(
    sorted.map((r) => r.place.id),
    ["plaza", "museo", "monserrate"]
  );
  assert.deepEqual(PLACES, original, "el arreglo original no debe cambiar");
});

test("within: filtra por radio", () => {
  const close = within(PLAZA, PLACES, 1000);
  assert.deepEqual(
    close.map((r) => r.place.id),
    ["plaza", "museo"]
  );
  assert.equal(within(PLAZA, PLACES, 1).length, 1);
});
