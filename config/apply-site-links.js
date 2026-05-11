/**
 * Aplica enlaces definidos en config/site-links.json a elementos con data-site-link="...".
 * La ruta al JSON se deduce de la URL de este script (válido desde la raíz del sitio o desde verify-email/).
 */
(function () {
  var sc = document.currentScript;
  if (!sc || !sc.src) return;
  var base = sc.src.replace(/[^/]+$/, "");

  function apply(cfg) {
    var urls = cfg && cfg.urls ? cfg.urls : {};
    document.querySelectorAll('[data-site-link="chromeExtensionInstall"]').forEach(function (el) {
      var u = urls.chromeExtensionInstall;
      if (!u || typeof u !== "string") return;
      el.setAttribute("href", u);
      if (/^https?:\/\//i.test(u)) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });
    document.querySelectorAll('[data-site-link="supportMailto"]').forEach(function (el) {
      var u = urls.supportMailto;
      if (!u || typeof u !== "string") return;
      el.setAttribute("href", u);
    });
  }

  fetch(base + "site-links.json", { credentials: "same-origin" })
    .then(function (r) {
      if (!r.ok) throw new Error("site-links status " + r.status);
      return r.json();
    })
    .then(apply)
    .catch(function () {});
})();
