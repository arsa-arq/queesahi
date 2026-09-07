/**
 * Avisos efímeros (estados de carga y error, sección 5.1 de ARCHITECTURE.md).
 *
 * El elemento es una región `aria-live="polite"`, de modo que un lector de
 * pantalla anuncia el mensaje sin interrumpir lo que esté leyendo.
 */

const DEFAULT_DURATION_MS = 5200;

/**
 * @param {HTMLElement} element
 */
export function createToast(element) {
  /** @type {ReturnType<typeof setTimeout>|undefined} */
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
        options.duration ?? DEFAULT_DURATION_MS
      );
    },

    hide() {
      clearTimeout(timer);
      element.classList.remove("show");
    }
  };
}
