import test from "node:test";
import assert from "node:assert/strict";

import {
  placeRepository,
  embeddedPlaceRepository,
  inMemoryPlaceRepository,
  types
} from "../helpers/loadApp.mjs";

const { createPlaceRepository } = placeRepository;
const { createEmbeddedPlaceRepository, parsePlacesDocument } = embeddedPlaceRepository;
const { createInMemoryPlaceRepository } = inMemoryPlaceRepository;
const { PLACE_STATUSES } = types;

/** @param {string} id @param {string} status */
const place = (id, status) => ({
  id,
  slug: id,
  name: id,
  status,
  latitude: 4.6,
  longitude: -74.07
});

const FIXTURE = [
  place("publicado", "published"),
  place("borrador", "draft"),
  place("en-revision", "review"),
  place("archivado", "archived")
];

const CATEGORIAS = [
  { id: "categoria-2", number: 2, name: "Categoría 2", color: "#E0951E" },
  { id: "categoria-1", number: 1, name: "Categoría 1", color: "#C74A2C" }
];

test("getAll: por defecto solo devuelve lo publicado", async () => {
  const repository = createInMemoryPlaceRepository(FIXTURE);
  const places = await repository.getAll();
  assert.deepEqual(
    places.map((p) => p.id),
    ["publicado"]
  );
});

test("getById: respeta el estado editorial", async () => {
  // Regresión: antes getAll filtraba por estado y getById no, así que un
  // borrador seguía siendo accesible si algo lo pedía por su id.
  const repository = createInMemoryPlaceRepository(FIXTURE);
  assert.equal(await repository.getById("borrador"), null);
  assert.equal((await repository.getById("publicado")).id, "publicado");
});

test("getBySlug: respeta el estado editorial", async () => {
  const repository = createInMemoryPlaceRepository(FIXTURE);
  assert.equal(await repository.getBySlug("en-revision"), null);
  assert.equal((await repository.getBySlug("publicado")).id, "publicado");
});

test("statuses: se puede pedir material no publicado explícitamente", async () => {
  const repository = createInMemoryPlaceRepository(FIXTURE);
  const todos = await repository.getAll({ statuses: [...PLACE_STATUSES] });
  assert.equal(todos.length, 4);
  const borrador = await repository.getById("borrador", { statuses: ["draft"] });
  assert.equal(borrador.id, "borrador");
});

test("getById: devuelve null para un id inexistente", async () => {
  const repository = createInMemoryPlaceRepository(FIXTURE);
  assert.equal(await repository.getById("no-existe"), null);
});

test("la carga se hace una sola vez y refresh() la repite", async () => {
  let loads = 0;
  const repository = createPlaceRepository(async () => {
    loads += 1;
    return { places: FIXTURE, categories: CATEGORIAS };
  });

  await Promise.all([repository.getAll(), repository.getAll(), repository.getById("publicado")]);
  assert.equal(loads, 1, "las llamadas concurrentes comparten una sola carga");

  await repository.refresh();
  assert.equal(loads, 2);
});

test("un fallo de carga no se queda cacheado", async () => {
  let attempts = 0;
  const repository = createPlaceRepository(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("datos corruptos");
    return { places: FIXTURE, categories: CATEGORIAS };
  });

  await assert.rejects(() => repository.getAll(), /datos corruptos/);
  const places = await repository.getAll();
  assert.equal(places.length, 1, "el segundo intento sí funciona");
});

test("el repositorio en memoria no comparte referencias con quien lo construye", async () => {
  const source = [place("publicado", "published")];
  const repository = createInMemoryPlaceRepository(source);
  source[0].name = "modificado por fuera";
  const [found] = await repository.getAll();
  assert.equal(found.name, "publicado");
});

test("parsePlacesDocument: acepta el envoltorio y el arreglo suelto", () => {
  const conEnvoltorio = parsePlacesDocument({ schemaVersion: 2, places: FIXTURE });
  assert.equal(conEnvoltorio.places.length, 4);
  assert.deepEqual(conEnvoltorio.categories, []);

  const suelto = parsePlacesDocument(FIXTURE);
  assert.equal(suelto.places.length, 4);
  assert.deepEqual(suelto.categories, [], "el formato antiguo no traía catálogo");
});

test("parsePlacesDocument: devuelve el catálogo cuando viene", () => {
  const doc = parsePlacesDocument({ schemaVersion: 2, places: FIXTURE, categories: CATEGORIAS });
  assert.equal(doc.categories.length, 2);
});

test("getCategories: devuelve el catálogo ordenado por número", async () => {
  // En el archivo pueden estar en cualquier orden; el menú lateral tiene que
  // presentarlas siempre igual.
  const repository = createInMemoryPlaceRepository(FIXTURE, CATEGORIAS);
  const categorias = await repository.getCategories();
  assert.deepEqual(
    categorias.map((c) => c.number),
    [1, 2]
  );
});

test("getCategories: vacío si el documento no trae catálogo", async () => {
  const repository = createInMemoryPlaceRepository(FIXTURE);
  assert.deepEqual(await repository.getCategories(), []);
});

test("parsePlacesDocument: rechaza un formato más nuevo del que entiende", () => {
  assert.throws(() => parsePlacesDocument({ schemaVersion: 99, places: [] }), /formato 99/);
});

test("parsePlacesDocument: rechaza basura", () => {
  assert.throws(() => parsePlacesDocument({ cosas: [] }), /formato esperado/);
  assert.throws(() => parsePlacesDocument(null), /formato esperado/);
});

test("repositorio embebido: lee el documento que se le pasa", async () => {
  const repository = createEmbeddedPlaceRepository({ schemaVersion: 2, places: FIXTURE });
  const places = await repository.getAll();
  assert.deepEqual(
    places.map((p) => p.id),
    ["publicado"]
  );
});

test("repositorio embebido: explica qué falta si no se cargaron los datos", async () => {
  // Caso real: alguien borra el <script> de places.js de index.html.
  const repository = createEmbeddedPlaceRepository(null);
  await assert.rejects(() => repository.getAll(), /formato esperado/);
});

test("repositorio embebido: usa el global cuando no se le pasa nada", async () => {
  const previous = globalThis.__QEA_PLACES__;
  globalThis.__QEA_PLACES__ = { schemaVersion: 2, places: FIXTURE };
  try {
    const repository = createEmbeddedPlaceRepository();
    assert.equal((await repository.getAll()).length, 1);
  } finally {
    globalThis.__QEA_PLACES__ = previous;
  }
});
