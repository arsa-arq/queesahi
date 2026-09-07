/**
 * Funcionalidad «places» — ficha de un lugar (secciones 5.1 y 5.2).
 *
 * Presentación pura: recibe un `Place` ya cargado y lo dibuja. No sabe de
 * repositorios, de red ni de geolocalización.
 *
 * Todo el texto pasa por la plantilla `html`, que escapa las interpolaciones.
 * Ver docs/adr/0003-escapado-html-en-las-fichas.md
 */

import { html, toHtmlString } from "../../utils/html.js";
import { formatDistance } from "../../services/geoService.js";
import { accentOf } from "../map/mapView.js";

/** @typedef {import("../../types/place.js").Place} Place */

/**
 * Enlace de navegación paso a paso. Las coordenadas se codifican como números,
 * nunca como texto libre.
 * @param {Place} place
 * @returns {string}
 */
function directionsUrl(place) {
  const destination = `${Number(place.latitude)},${Number(place.longitude)}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/**
 * Enlace al mismo punto en OpenStreetMap.
 * @param {Place} place
 * @returns {string}
 */
function osmUrl(place) {
  const lat = Number(place.latitude);
  const lon = Number(place.longitude);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

/**
 * Bloque titulado, omitido si no hay contenido.
 * @param {string} label
 * @param {string|undefined} text
 */
function block(label, text) {
  if (!text) return "";
  return html`<section class="block"><h3>${label}</h3><p>${text}</p></section>`;
}

/**
 * @param {{
 *   sheet: HTMLElement,
 *   backdrop: HTMLElement,
 *   closeButton: HTMLElement,
 *   title: HTMLElement,
 *   emoji: HTMLElement,
 *   body: HTMLElement,
 *   banner: HTMLElement,
 *   inertWhileOpen: HTMLElement[],
 *   onClose?: () => void
 * }} elements
 */
export function createPlaceSheet({
  sheet,
  backdrop,
  closeButton,
  title,
  emoji,
  body,
  banner,
  inertWhileOpen,
  onClose = () => {}
}) {
  /** @type {Element|null} */
  let lastFocused = null;
  let open = false;

  /**
   * Atrapa el foco marcando como `inert` todo lo que está fuera de la ficha
   * mientras está abierta, y la propia ficha mientras está cerrada. Es lo que
   * hace honesto el `aria-modal="true"` del marcado: sin esto, el tabulador
   * seguía recorriendo el mapa por detrás del diálogo.
   * @param {boolean} isOpen
   */
  function setInert(isOpen) {
    sheet.inert = !isOpen;
    for (const element of inertWhileOpen) element.inert = isOpen;
  }

  setInert(false);

  function close() {
    if (!open) return;
    open = false;
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("open");
    setInert(false);
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
    onClose();
  }

  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) close();
  });

  return {
    isOpen: () => open,
    close,

    /**
     * @param {Place} place
     * @param {{ distance?: number }} [options]
     */
    show(place, options = {}) {
      lastFocused = document.activeElement;

      const accent = accentOf(place);
      const distance =
        typeof options.distance === "number"
          ? html`<span class="chip dist">a ${formatDistance(options.distance)} de ti</span>`
          : "";
      const categories = (place.categories || []).map(
        (category) => html`<span class="chip">${category}</span>`
      );
      const sources = (place.sources || []).join(" · ");

      title.textContent = place.name;
      emoji.textContent = place.emoji || "📍";
      banner.style.setProperty("--c", accent);

      body.innerHTML = toHtmlString(html`
        <div class="meta">${distance}${categories}</div>
        <p class="summary">${place.summary}</p>
        <p class="location"><span aria-hidden="true">📌</span> ${place.location}</p>
        <section class="block"><p>${place.description}</p></section>
        ${block("Por qué importa", place.whyItMatters)}
        ${block("Míralo de cerca", place.lookCloser)}
        ${block("Contexto histórico", place.historicalContext)}
        ${block("Curiosidad", place.curiosity)}
        <div class="actions">
          <a href="${directionsUrl(place)}" target="_blank" rel="noopener noreferrer">Cómo llegar</a>
          <a class="ghost" href="${osmUrl(place)}" target="_blank" rel="noopener noreferrer">Ver en OSM</a>
        </div>
        <p class="sources"><strong>Fuentes:</strong> ${sources || "—"}</p>
      `);

      // El cuerpo conserva el desplazamiento de la ficha anterior si no se
      // reinicia: al abrir un lugar nuevo hay que empezar por arriba.
      body.scrollTop = 0;

      open = true;
      sheet.classList.add("open");
      sheet.setAttribute("aria-hidden", "false");
      backdrop.classList.add("open");
      setInert(true);
      /** @type {HTMLElement} */ (closeButton).focus();
    }
  };
}
