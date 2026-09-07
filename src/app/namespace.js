/**
 * Espacio de nombres común. **Debe cargarse antes que cualquier otro archivo.**
 *
 * ¿Por qué no módulos ES? Porque el navegador los bloquea cuando la página se
 * abre con doble clic, y poder abrir `index.html` sin servidor ni instalación
 * es un requisito del proyecto, no un lujo: buena parte del equipo de la
 * Cátedra no es de perfil técnico. Ver docs/adr/0005.
 *
 * A cambio, cada archivo se registra aquí y declara de quién depende. El orden
 * de carga lo fija `index.html`; `QEA.require()` convierte un orden equivocado
 * en un error con nombre y apellido, en vez de un «undefined» a mitad de
 * ejecución.
 *
 * Los archivos siguen siendo válidos como módulos ES sin exportaciones, así que
 * las pruebas de Node pueden importarlos tal cual.
 */

(function (global) {
  "use strict";

  // `any` a propósito: este objeto se puebla en tiempo de ejecución desde una
  // docena de archivos. El chequeo de tipos vive dentro de cada módulo, no en
  // la frontera entre ellos; es el precio de no usar módulos ES (ADR 0005).
  const QEA = /** @type {any} */ (global.QEA = global.QEA || {});

  /**
   * Devuelve un módulo ya registrado o falla diciendo cuál falta.
   * @param {string} name
   * @returns {any}
   */
  QEA.require = function require(name) {
    const found = QEA[name];
    if (!found) {
      throw new Error(
        `«${name}» no está cargado todavía. Revisa el orden de los <script> en index.html.`
      );
    }
    return found;
  };

  /**
   * Registra un módulo. Avisa si se registra dos veces, que casi siempre
   * significa un `<script>` duplicado.
   * @param {string} name
   * @param {any} value
   */
  QEA.define = function define(name, value) {
    if (QEA[name] && global.console) {
      global.console.warn(`[¿Qué es ahí?] «${name}» se registró dos veces.`);
    }
    QEA[name] = value;
    return value;
  };
})(globalThis);
