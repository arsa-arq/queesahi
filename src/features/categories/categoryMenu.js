/**
 * Funcionalidad «categories» — menú lateral de filtros (sección 5.2).
 *
 * Presentación pura: recibe el catálogo y los recuentos, dibuja la lista y
 * avisa de los cambios. No sabe filtrar; de eso se ocupa `categoryService`.
 *
 * La selección es múltiple y vacía significa «todas», que es lo que espera
 * quien abre el menú y no toca nada.
 *
 * Depende de: app/namespace.js, utils/html.js
 */

(function (global) {
  "use strict";

  const QEA = global.QEA;
  const { escapeHtml } = QEA.require("html");

  /**
   * @param {{
   *   panel: any,
   *   backdrop: HTMLElement,
   *   list: HTMLElement,
   *   openButton: HTMLButtonElement,
   *   closeButton: HTMLElement,
   *   resetButton: HTMLButtonElement,
   *   summary: HTMLElement,
   *   inertWhileOpen: any[],
   *   onChange: (selectedIds: string[]) => void
   * }} elements
   */
  function createCategoryMenu({
    panel,
    backdrop,
    list,
    openButton,
    closeButton,
    resetButton,
    summary,
    inertWhileOpen,
    onChange
  }) {
    /** @type {Category[]} */
    let categories = [];
    /** @type {Record<string, number>} */
    let counts = {};
    /** @type {Set<string>} */
    const selected = new Set();
    let open = false;

    /**
     * Mismo mecanismo que la ficha: `inert` fuera mientras está abierto, e
     * `inert` en el panel mientras está cerrado. Sin esto el tabulador seguiría
     * recorriendo el mapa por detrás del menú.
     * @param {boolean} isOpen
     */
    function setInert(isOpen) {
      panel.inert = !isOpen;
      for (const element of inertWhileOpen) element.inert = isOpen;
    }

    setInert(false);

    function updateSummary() {
      const total = selected.size;
      openButton.setAttribute(
        "aria-label",
        total === 0
          ? "Filtrar por categoría. Ahora se muestran todas."
          : `Filtrar por categoría. ${total} de ${categories.length} seleccionadas.`
      );
      // El contador sobre el botón avisa de que hay un filtro puesto: sin él,
      // es fácil olvidar por qué faltan lugares en el mapa.
      openButton.classList.toggle("filtered", total > 0);
      const badge = openButton.querySelector(".badge");
      if (badge) {
        badge.textContent = total > 0 ? String(total) : "";
        /** @type {HTMLElement} */ (badge).hidden = total === 0;
      }

      summary.textContent =
        total === 0
          ? "Se muestran las siete categorías."
          : total === 1
            ? "1 categoría seleccionada."
            : `${total} categorías seleccionadas.`;

      resetButton.disabled = total === 0;
    }

    function render() {
      list.textContent = "";

      for (const category of categories) {
        const count = counts[category.id] || 0;
        const isSelected = selected.has(category.id);

        const item = document.createElement("li");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "category";
        button.setAttribute("aria-pressed", String(isSelected));
        button.dataset.categoryId = category.id;
        button.style.setProperty("--cat-color", category.color);
        if (count === 0) button.classList.add("empty");

        button.innerHTML =
          `<span class="swatch" aria-hidden="true"></span>` +
          `<span class="name">${escapeHtml(category.name)}</span>` +
          `<span class="count" aria-hidden="true">${count}</span>`;

        // El recuento se repite en texto para lectores de pantalla, porque
        // «3» suelto junto a un nombre no dice qué son tres.
        const sr = document.createElement("span");
        sr.className = "visually-hidden";
        sr.textContent = count === 1 ? " · 1 lugar" : ` · ${count} lugares`;
        button.append(sr);

        button.addEventListener("click", () => toggle(category.id));

        item.append(button);
        list.append(item);
      }

      updateSummary();
    }

    /** @param {string} id */
    function toggle(id) {
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      render();
      onChange([...selected]);
    }

    function reset() {
      if (selected.size === 0) return;
      selected.clear();
      render();
      onChange([]);
    }

    /** @type {Element|null} */
    let lastFocused = null;

    function show() {
      if (open) return;
      lastFocused = document.activeElement;
      open = true;
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      backdrop.classList.add("open");
      openButton.setAttribute("aria-expanded", "true");
      setInert(true);
      /** @type {HTMLElement} */ (closeButton).focus();
    }

    function close() {
      if (!open) return;
      open = false;
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      backdrop.classList.remove("open");
      openButton.setAttribute("aria-expanded", "false");
      setInert(false);
      if (lastFocused instanceof HTMLElement) lastFocused.focus();
    }

    openButton.addEventListener("click", () => (open ? close() : show()));
    closeButton.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    resetButton.addEventListener("click", reset);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open) close();
    });

    return {
      isOpen: () => open,
      show,
      close,

      /**
       * @param {Category[]} nextCategories
       * @param {Record<string, number>} nextCounts
       */
      setCategories(nextCategories, nextCounts) {
        categories = nextCategories;
        counts = nextCounts;
        // Una categoría que desaparece del catálogo no puede quedar
        // seleccionada de forma invisible.
        const known = new Set(categories.map((category) => category.id));
        for (const id of [...selected]) if (!known.has(id)) selected.delete(id);
        render();
      },

      getSelected: () => [...selected],
      reset
    };
  }

  QEA.define("categoryMenu", { createCategoryMenu });
})(globalThis);
