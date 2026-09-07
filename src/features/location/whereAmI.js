/**
 * Funcionalidad «location» — el botón «¿Qué es ahí?» (sección 5.2).
 *
 * Orquesta el gesto central del producto: pedir la ubicación, encontrar el
 * lugar más cercano y abrir su ficha. Recibe sus dependencias por parámetro,
 * de modo que la lógica del flujo se puede seguir —y probar— sin depender de
 * un mapa real.
 *
 * Depende de: app/namespace.js, app/config.js, services/geoService.js,
 *             services/locationService.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;
  const { nearest, formatDistance } = QEA.require("geoService");
  const { getCurrentPosition, getLastKnownPosition } = QEA.require("locationService");
  const { FAR_AWAY_METERS } = QEA.require("config");

  /**
   * Mensajes de error orientados a la acción: cada uno dice qué puede hacer la
   * persona a continuación.
   * @type {Record<string, string>}
   */
  const ERROR_MESSAGES = {
    unsupported: "Este dispositivo no permite geolocalización.",
    denied: "Permiso de ubicación denegado. Actívalo en tu navegador para usar esta función.",
    unavailable: "No pudimos obtener tu ubicación. Inténtalo de nuevo al aire libre.",
    timeout: "La ubicación está tardando demasiado. Inténtalo de nuevo al aire libre.",
    unknown: "No pudimos obtener tu ubicación. Inténtalo de nuevo."
  };

  /**
   * Controlador del botón: estado ocupado y bloqueo de pulsaciones repetidas.
   * @param {HTMLButtonElement} button
   */
  function createLocateButton(button) {
    const label = button.querySelector(".label");
    const idleText = label ? label.textContent : "";

    return {
      /** @param {boolean} busy */
      setBusy(busy) {
        button.disabled = busy;
        button.classList.toggle("busy", busy);
        button.setAttribute("aria-busy", String(busy));
        if (label) label.textContent = busy ? "Ubicándote…" : idleText;
      }
    };
  }

  /**
   * Construye el manejador del botón «¿Qué es ahí?».
   *
   * @param {{
   *   getPlaces: () => Promise<Place[]>,
   *   showUser: (point: GeoPoint) => void,
   *   focusPlace: (place: Place) => void,
   *   openPlace: (place: Place, options: { distance: number }) => void,
   *   notify: (message: string) => void,
   *   setBusy: (busy: boolean) => void
   * }} deps
   * @returns {() => Promise<void>}
   */
  function createWhereAmIHandler({
    getPlaces,
    showUser,
    focusPlace,
    openPlace,
    notify,
    setBusy
  }) {
    let running = false;

    return async function whereAmI() {
      if (running) return;
      running = true;
      setBusy(true);
      notify("");

      try {
        const places = await getPlaces();
        if (places.length === 0) {
          notify("No hay lugares cargados todavía.");
          return;
        }

        /** @type {GeoPoint} */
        let point;
        try {
          point = await getCurrentPosition();
        } catch (error) {
          // Local-first (sección 6): antes de rendirse, se intenta con la
          // última posición conocida.
          const lastKnown = getLastKnownPosition();
          if (!lastKnown) {
            const code = /** @type {any} */ (error) && /** @type {any} */ (error).code;
            notify(ERROR_MESSAGES[code] || ERROR_MESSAGES.unknown);
            return;
          }
          notify("Sin señal de GPS ahora: uso tu última ubicación conocida.");
          point = lastKnown;
        }

        showUser(point);

        const result = nearest(point, places);
        if (!result) {
          notify("No hay lugares cargados todavía.");
          return;
        }

        if (result.distance > FAR_AWAY_METERS) {
          notify(
            `Estás a ${formatDistance(result.distance)} del punto más cercano ` +
              `(${result.place.name}). Te lo muestro igual.`
          );
        }

        focusPlace(result.place);
        openPlace(result.place, { distance: result.distance });
      } catch (error) {
        console.error("[¿Qué es ahí?] fallo al ubicar", error);
        notify("Algo salió mal al buscar lugares cercanos. Vuelve a intentarlo.");
      } finally {
        setBusy(false);
        running = false;
      }
    };
  }

  QEA.define("whereAmI", { createLocateButton, createWhereAmIHandler, ERROR_MESSAGES });
})(globalThis);
