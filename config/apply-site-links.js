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

  function youtubeId(url) {
    var m = String(url).match(
      /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : "";
  }

  function vimeoId(url) {
    var m = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : "";
  }

  function resolveVideo(url) {
    url = String(url || "").trim();
    if (!url) return null;
    var yt = youtubeId(url);
    if (yt) {
      return { type: "iframe", src: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(yt) };
    }
    var vm = vimeoId(url);
    if (vm) {
      return { type: "iframe", src: "https://player.vimeo.com/video/" + encodeURIComponent(vm) };
    }
    if (/youtube\.com\/embed\/|player\.vimeo\.com\/video\//i.test(url)) {
      return { type: "iframe", src: url };
    }
    return { type: "video", src: url };
  }

  function mountVideo(key, url) {
    var resolved = resolveVideo(url);
    document.querySelectorAll('[data-site-video-block="' + key + '"]').forEach(function (block) {
      if (!resolved) {
        block.setAttribute("hidden", "");
        return;
      }
      var host = block.querySelector("[data-site-video]");
      if (!host) return;
      host.replaceChildren();
      var frame = document.createElement("div");
      frame.className = "guide-video-frame";
      if (resolved.type === "iframe") {
        var iframe = document.createElement("iframe");
        iframe.src = resolved.src;
        iframe.title = block.getAttribute("data-video-title") || "Vídeo";
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        );
        iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        iframe.setAttribute("loading", "lazy");
        frame.appendChild(iframe);
      } else {
        var video = document.createElement("video");
        video.src = resolved.src;
        video.controls = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("preload", "metadata");
        frame.appendChild(video);
      }
      host.appendChild(frame);
      block.removeAttribute("hidden");
    });
  }

  function apply(cfg) {
    var urls = cfg && cfg.urls ? cfg.urls : {};
    var videos = cfg && cfg.videos ? cfg.videos : {};
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

    mountVideo("installExtension", videos.installExtension);
    mountVideo("withdrawRewards", videos.withdrawRewards);
  }

  fetch(base + "site-links.json", { credentials: "same-origin" })
    .then(function (r) {
      if (!r.ok) throw new Error("site-links status " + r.status);
      return r.json();
    })
    .then(apply)
    .catch(function () {});
})();
