/**
 * Aplica enlaces definidos en config/site-links.json a elementos con data-site-link="...".
 * La ruta al JSON se deduce de la URL de este script (válido desde la raíz del sitio o desde verify-email/).
 */
(function () {
  var sc = document.currentScript;
  if (!sc || !sc.src) return;
  var base = sc.src.replace(/[^/]+$/, "");

  function chromeExtensionInstallUrl(cfg) {
    var ext = cfg && cfg.chromeExtension;
    var id = ext && ext.id ? String(ext.id).trim() : "";
    if (!id) {
      var legacy = cfg && cfg.urls && cfg.urls.chromeExtensionInstall;
      return typeof legacy === "string" ? legacy : "";
    }
    var slug = ext.slug && String(ext.slug).trim() ? String(ext.slug).trim() : "lensrewards";
    return (
      "https://chromewebstore.google.com/detail/" +
      slug +
      "/" +
      id +
      "?hl=es&utm_source=lensrewards_web"
    );
  }

  function apply(cfg) {
    var urls = cfg && cfg.urls ? cfg.urls : {};
    var extensionInstallUrl = chromeExtensionInstallUrl(cfg);

    document.querySelectorAll('[data-site-link="chromeExtensionInstall"]').forEach(function (el) {
      if (!extensionInstallUrl) return;
      el.setAttribute("href", extensionInstallUrl);
      if (/^https?:\/\//i.test(extensionInstallUrl)) {
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
