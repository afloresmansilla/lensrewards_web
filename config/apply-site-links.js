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

  function sendGaEvent(name, params) {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
      return;
    }
    window.dataLayer.push(["event", name, params]);
  }

  function trackExtensionInstallClick(el, url) {
    if (!el || el.getAttribute("data-ga-click-tracked")) return;
    el.setAttribute("data-ga-click-tracked", "1");
    el.addEventListener("click", function () {
      var text = (el.textContent || "").replace(/\s+/g, " ").trim();
      var isButton = el.classList.contains("btn") || el.classList.contains("ghost");
      sendGaEvent("add_to_chrome", {
        link_text: text,
        link_url: url || el.getAttribute("href") || "",
        link_type: isButton ? "button" : "link",
        page_path: window.location.pathname
      });
    });
  }

  function trackHtml5Video(video, meta) {
    if (!video || video.getAttribute("data-ga-video-tracked")) return;
    video.setAttribute("data-ga-video-tracked", "1");

    var started = false;
    var sentProgress = {};

    function baseParams() {
      var duration = Math.round(video.duration || 0);
      var current = Math.round(video.currentTime || 0);
      var percent = duration > 0 ? Math.round((current / duration) * 100) : 0;
      return {
        video_title: meta.title,
        video_url: meta.url,
        video_id: meta.id,
        video_provider: "html5",
        video_duration: duration,
        video_current_time: current,
        video_percent: percent
      };
    }

    video.addEventListener("play", function () {
      if (started) return;
      started = true;
      sendGaEvent("video_start", baseParams());
    });

    video.addEventListener("timeupdate", function () {
      var duration = video.duration || 0;
      if (!duration || duration < 1) return;
      var percent = Math.floor(((video.currentTime || 0) / duration) * 100);
      [10, 25, 50, 75].forEach(function (mark) {
        if (percent >= mark && !sentProgress[mark]) {
          sentProgress[mark] = true;
          var params = baseParams();
          params.video_percent = mark;
          sendGaEvent("video_progress", params);
        }
      });
    });

    video.addEventListener("ended", function () {
      var params = baseParams();
      params.video_percent = 100;
      sendGaEvent("video_complete", params);
    });
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
      var title = block.getAttribute("data-video-title") || "Vídeo";
      if (resolved.type === "iframe") {
        var iframe = document.createElement("iframe");
        iframe.src = resolved.src;
        iframe.title = title;
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
        trackHtml5Video(video, { id: key, title: title, url: resolved.src });
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
      trackExtensionInstallClick(el, extensionInstallUrl);
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
