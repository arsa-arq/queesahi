/**
 * Punto de entrada: conecta las capas.
 *
 * Este archivo es el único que conoce a la vez el repositorio, los servicios y
 * la interfaz. Cada capa por separado no sabe nada de las otras, que es lo que
 * permite cambiar la fuente de datos (JSON → IndexedDB → Supabase) sin tocar
 * la presentación.
 */

import { PLACE_ROUTE_PREFIX } from "./config.js";
import { createJsonPlaceRepository } from "../repositories/jsonPlaceRepository.js";
import { distanceMeters } from "../services/geoService.js";
import { getLastKnownPosition } from "../services/locationService.js";
import { createMapView } from "../features/map/mapView.js";
import { createPlaceSheet } from "../features/places/placeSheet.js";
import { createLocateButton, createWhereAmIHandler } from "../features/location/whereAmI.js";
import { createToast } from "../ui/toast.js";

/** @typedef {import("../types/place.js").Place} Place */

/**
 * @template {Element} T
 * @param {string} selector
 * @returns {T}
 */
function need(selector) {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Falta el elemento «${selector}» en index.html`);
  return /** @type {T} */ (element);
}

/**
 * Mensaje a pantalla completa cuando la aplicación no puede arrancar.
 * @param {string} message
 */
function showFatalError(message) {
  const map = document.getElementById("map");
  if (!map) return;
  map.innerHTML = "";
  const box = document.createElement("div");
  box.className = "fatal";
  box.setAttribute("role", "alert");
  box.textContent = message;
  map.append(box);
}

async function start() {
  const leaflet = /** @type {any} */ (window).L;
  if (!leaflet) {
    showFatalError("No se pudo cargar Leaflet. Revisa tu conexión a internet y recarga la página.");
    return;
  }

  const repository = createJsonPlaceRepository();
  const toast = createToast(need("#toast"));

  const sheet = createPlaceSheet({
    sheet: need("#sheet"),
    backdrop: need("#backdrop"),
    closeButton: need("#sheetClose"),
    title: need("#sheetTitle"),
    emoji: need("#sheetEmoji"),
    body: need("#sheetBody"),
    banner: need("#sheet .banner"),
    inertWhileOpen: [need("#map"), need(".topbar"), need(".cta-wrap")],
    onClose: () => clearRoute()
  });

  const mapView = createMapView({
    container: need("#map"),
    leaflet,
    onSelect: (place) => openPlace(place)
  });

  // --- Enlaces profundos: #/lugar/<slug> ---------------------------------
  // Permiten compartir un lugar concreto y hacen que el botón «atrás» del
  // navegador cierre la ficha, que es lo que un usuario de móvil espera.

  /** @returns {string|null} */
  function routeSlug() {
    const hash = window.location.hash;
    if (!hash.startsWith(PLACE_ROUTE_PREFIX)) return null;
    return decodeURIComponent(hash.slice(PLACE_ROUTE_PREFIX.length)) || null;
  }

  function clearRoute() {
    if (!routeSlug()) return;
    // `replaceState` no dispara `hashchange`, así que no se realimenta con el
    // cierre de la ficha que acaba de ocurrir.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  /**
   * Distancia estimada usando la última posición conocida, para que la ficha
   * abierta desde el mapa también diga a qué distancia queda.
   * @param {Place} place
   * @returns {number|undefined}
   */
  function estimatedDistance(place) {
    const lastKnown = getLastKnownPosition();
    return lastKnown ? distanceMeters(lastKnown, place) : undefined;
  }

  /**
   * @param {Place} place
   * @param {{ distance?: number }} [options]
   */
  function openPlace(place, options = {}) {
    const distance = options.distance ?? estimatedDistance(place);
    sheet.show(place, distance === undefined ? {} : { distance });

    const target = PLACE_ROUTE_PREFIX + place.slug;
    if (window.location.hash !== target) window.location.hash = target;
  }

  /** @param {string} slug */
  async function openBySlug(slug) {
    const place = await repository.getBySlug(slug);
    if (!place) {
      toast.show("No encontramos ese lugar. Te dejo en el mapa.");
      clearRoute();
      sheet.close();
      return;
    }
    mapView.focusPlace(place);
    openPlace(place);
  }

  window.addEventListener("hashchange", () => {
    const slug = routeSlug();
    if (slug) openBySlug(slug);
    else sheet.close();
  });

  // --- Carga de datos -----------------------------------------------------

  /** @type {Place[]} */
  let places;
  try {
    places = await repository.getAll();
  } catch (error) {
    console.error("[¿Qué es ahí?] no se pudieron cargar los lugares", error);
    showFatalError(
      error instanceof Error && error.message
        ? error.message
        : "No se pudieron cargar los lugares. Recarga la página."
    );
    return;
  }

  if (places.length === 0) {
    showFatalError("Todavía no hay lugares publicados.");
    return;
  }

  mapView.setPlaces(places);

  // --- Botón «¿Qué es ahí?» ----------------------------------------------

  const button = /** @type {HTMLButtonElement} */ (need("#btnHere"));
  const locateButton = createLocateButton(button);

  const whereAmI = createWhereAmIHandler({
    getPlaces: () => repository.getAll(),
    showUser: (point) => mapView.showUser(point),
    focusPlace: (place) => mapView.focusPlace(place),
    openPlace: (place, options) => openPlace(place, options),
    notify: (message) => toast.show(message),
    setBusy: (busy) => locateButton.setBusy(busy)
  });

  button.addEventListener("click", () => {
    void whereAmI();
  });

  // Si la página se abrió con un enlace a un lugar concreto, ábrelo.
  const initialSlug = routeSlug();
  if (initialSlug) await openBySlug(initialSlug);
}

start().catch((error) => {
  console.error("[¿Qué es ahí?] fallo al iniciar", error);
  showFatalError("La aplicación no pudo iniciarse. Recarga la página.");
});
