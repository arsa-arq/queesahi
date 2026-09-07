/**
 * Avisos efímeros (estados de carga y error, sección 5.1 de ARCHITECTURE.md).
 *
 * El elemento es una región `aria-live="polite"`, de modo que un lector de
 * pantalla anuncia el mensaje sin interrumpir lo que esté leyendo.
 *
 * Depende de: app/namespace.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;
  const DEFAULT_DURATION_MS = 5200;

  /**
   * @param {HTMLElement} element
   */
  function createToast(element) {
    /** @type {any} */
    let timer;

    return {
      /**
       * @param {string} message Cadena vacía para ocultar.
       * @param {{ duration?: number }} [options]
       */
      show(message, options = {}) {
        clearTimeout(timer);
        if (!message) {
          element.classList.remove("show");
          return;
        }
        element.textContent = message;
        element.classList.add("show");
        timer = setTimeout(
          () => element.classList.remove("show"),
          options.duration === undefined ? DEFAULT_DURATION_MS : options.duration
        );
      },

      hide() {
        clearTimeout(timer);
        element.classList.remove("show");
      }
    };
  }

  QEA.define("toast", { createToast });
})(globalThis);
