/**
 * Funcionalidad «map» (sección 5.2 de ARCHITECTURE.md).
 *
 * Envuelve Leaflet por completo: es el único archivo que conoce la librería.
 * Si algún día se cambia de motor cartográfico, se reescribe este módulo y
 * nada más, porque el resto del código solo usa la interfaz que devuelve
 * `createMapView`.
 *
 * Depende de: app/namespace.js, app/config.js, utils/html.js,
 *             services/categoryService.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;
  const { escapeHtml, isHexColor } = QEA.require("html");
  const { DEFAULT_ACCENT, MAP_CENTER, MAP_ZOOM, TILE_LAYER } = QEA.require("config");
  const { primaryCategory } = QEA.require("categoryService");

  /**
   * Color de acento de un lugar: el de su categoría.
   *
   * Desde que existen las siete categorías, el color dejó de ser una propiedad
   * del lugar y pasó a ser lo que agrupa el mapa: dos predios del mismo tipo se
   * ven iguales, y al filtrar se entiende qué quedó.
   *
   * Un valor mal escrito —por ejemplo `"#7C8B4A;"`— se descarta aquí en lugar
   * de llegar al CSS, donde fallaba en silencio y solo en algunos sitios.
   *
   * @param {Place} place
   * @param {Category[]} [categories]
   * @returns {string}
   */
  function accentOf(place, categories) {
    const category = categories ? primaryCategory(place, categories) : null;
    const color = category ? category.color : undefined;
    return isHexColor(color) ? /** @type {string} */ (color) : DEFAULT_ACCENT;
  }

  /**
   * @param {{
   *   container: HTMLElement,
   *   leaflet: any,
   *   onSelect: (place: Place) => void
   * }} options
   */
  function createMapView({ container, leaflet: L, onSelect }) {
    /** @type {Category[]} */
    let categories = [];
    const map = L.map(container, { zoomControl: false, attributionControl: true }).setView(
      MAP_CENTER,
      MAP_ZOOM.initial
    );

    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer(TILE_LAYER.url, {
      maxZoom: MAP_ZOOM.max,
      attribution: TILE_LAYER.attribution
    }).addTo(map);

    /** @type {Map<string, any>} */
    const markers = new Map();
    /** @type {any} */
    let userMarker = null;
    /** @type {any} */
    let accuracyCircle = null;

    return {
      /**
       * Catálogo de categorías, del que sale el color de cada marcador.
       * @param {Category[]} nextCategories
       */
      setCategories(nextCategories) {
        categories = nextCategories;
      },

      /**
       * Dibuja los marcadores y encuadra el mapa sobre ellos.
       *
       * @param {Place[]} places
       * @param {{ fit?: boolean }} [options] `fit: false` deja la vista donde
       *   está. Al aplicar un filtro conviene reencuadrar; al abrir un lugar
       *   concreto, no, porque pelearía con el `flyTo`.
       */
      setPlaces(places, options = {}) {
        for (const marker of markers.values()) marker.remove();
        markers.clear();

        /** @type {[number, number][]} */
        const bounds = [];

        for (const place of places) {
          const icon = L.divIcon({
            className: "",
            // `escapeHtml` protege el atributo de estilo y el contenido: el
            // emoji y el color vienen de datos, no del código.
            html:
              `<div class="poi-pin" style="--pin-color:${escapeHtml(accentOf(place, categories))}">` +
              `<span>${escapeHtml(place.emoji || "📍")}</span></div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 32]
          });

          const marker = L.marker([place.latitude, place.longitude], {
            icon,
            keyboard: true,
            title: place.name,
            alt: `Lugar de interés: ${place.name}`
          }).addTo(map);

          marker.on("click", () => onSelect(place));
          marker.on("keypress", (/** @type {any} */ event) => {
            const key = event.originalEvent && event.originalEvent.key;
            if (key === "Enter" || key === " ") onSelect(place);
          });

          markers.set(place.id, marker);
          bounds.push([place.latitude, place.longitude]);
        }

        if (bounds.length > 0 && options.fit !== false) {
          map.fitBounds(bounds, { padding: [70, 70], maxZoom: MAP_ZOOM.initial });
        }
      },

      /**
       * Centra el mapa en un lugar.
       * @param {Place} place
       */
      focusPlace(place) {
        map.flyTo([place.latitude, place.longitude], MAP_ZOOM.focus, { duration: 0.6 });
      },

      /**
       * Dibuja (o mueve) el punto del usuario y su círculo de precisión.
       * @param {GeoPoint} point
       */
      showUser(point) {
        /** @type {[number, number]} */
        const latLng = [point.latitude, point.longitude];

        if (userMarker) {
          userMarker.setLatLng(latLng);
        } else {
          userMarker = L.marker(latLng, {
            icon: L.divIcon({
              className: "",
              html: '<div class="user-dot"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            }),
            zIndexOffset: 1000,
            interactive: false,
            // Sin esto, un lector de pantalla anunciaría el marcador como
            // un elemento sin nombre.
            alt: "Tu ubicación aproximada"
          }).addTo(map);
        }

        if (!point.accuracy) return;
        if (accuracyCircle) {
          accuracyCircle.setLatLng(latLng).setRadius(point.accuracy);
        } else {
          accuracyCircle = L.circle(latLng, {
            radius: point.accuracy,
            color: DEFAULT_ACCENT,
            weight: 1,
            fillColor: DEFAULT_ACCENT,
            fillOpacity: 0.12,
            interactive: false
          }).addTo(map);
        }
      }
    };
  }

  QEA.define("mapView", { createMapView, accentOf });
})(globalThis);
