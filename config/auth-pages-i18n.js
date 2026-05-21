/**
 * Traducciones ES/EN para olvide-contrasena y reset-password.
 * Uso: LensAuthI18n.init({ page: "forgot"|"reset", basePath: "./" o "../" })
 */
(function (global) {
  var STORAGE_KEY = "lr_lang";
  var SUPPORTED = ["es", "en"];

  var STRINGS = {
    es: {
      common: {
        langLabel: "Idioma",
        langEs: "Español",
        langEn: "English",
      },
      forgot: {
        metaTitle: "LensRewards - He olvidado mi contraseña",
        metaDescription: "Recupera el acceso a tu cuenta de LensRewards.",
        back: "← Volver",
        h1: "He olvidado mi contraseña",
        sub: "Introduce el correo con el que te registraste. Si existe una cuenta, te enviaremos un enlace para elegir una nueva contraseña.",
        emailLabel: "Correo electrónico",
        emailPlaceholder: "tu@email.com",
        submitBtn: "Enviar enlace de recuperación",
        errEmailRequired: "Introduce tu correo electrónico.",
        errConnection: "Error de conexión. Inténtalo de nuevo.",
        errGeneric: "No se pudo procesar la solicitud.",
        errEmailNotFound: "No hay ninguna cuenta registrada con ese email",
        sending: "Enviando solicitud…",
        successDefault: "Te hemos enviado un email con instrucciones para restablecer tu contraseña",
      },
      reset: {
        metaTitle: "LensRewards - Nueva contraseña",
        metaDescription: "Establece una nueva contraseña para tu cuenta de LensRewards.",
        back: "Solicitar nuevo enlace",
        h1: "Nueva contraseña",
        sub: "Elige una contraseña segura. Después podrás iniciar sesión en la extensión con tu correo y la nueva contraseña.",
        passwordLabel: "Nueva contraseña",
        passwordPlaceholder: "Mínimo 8 caracteres",
        confirmLabel: "Repetir contraseña",
        confirmPlaceholder: "Repite la contraseña",
        strengthEmpty: "Seguridad: —",
        strengthWeak: "Seguridad: baja",
        strengthMedium: "Seguridad: media",
        strengthStrong: "Seguridad: alta",
        submitBtn: "Guardar contraseña",
        errTokenMissing: "Enlace no válido: falta el token de recuperación. Solicita un nuevo enlace desde la página de recuperación.",
        errPasswordMin: "La contraseña debe tener mínimo 8 caracteres.",
        errPasswordMismatch: "Las contraseñas no coinciden.",
        errPasswordWeak: "La contraseña es demasiado débil.",
        errTokenExpired: "El enlace ha caducado. Solicita uno nuevo.",
        errTokenUsed: "Este enlace ya se utilizó. Solicita uno nuevo si lo necesitas.",
        errTokenInvalid: "Enlace no válido. Solicita un nuevo enlace de recuperación.",
        errConnection: "Error de conexión. Inténtalo de nuevo.",
        errGeneric: "No se pudo restablecer la contraseña.",
        saving: "Guardando contraseña…",
        successDefault: "Contraseña actualizada correctamente",
        linkFirstSteps: "Ir a primeros pasos",
        linkHome: "Volver al inicio",
      },
    },
    en: {
      common: {
        langLabel: "Language",
        langEs: "Español",
        langEn: "English",
      },
      forgot: {
        metaTitle: "LensRewards - Forgot password",
        metaDescription: "Recover access to your LensRewards account.",
        back: "← Back",
        h1: "Forgot your password",
        sub: "Enter the email you used to register. If an account exists, we will send you a link to choose a new password.",
        emailLabel: "Email address",
        emailPlaceholder: "you@email.com",
        submitBtn: "Send recovery link",
        errEmailRequired: "Please enter your email address.",
        errConnection: "Connection error. Please try again.",
        errGeneric: "We could not process your request.",
        errEmailNotFound: "No account is registered with that email",
        sending: "Sending request…",
        successDefault: "We have sent you an email with instructions to reset your password",
      },
      reset: {
        metaTitle: "LensRewards - New password",
        metaDescription: "Set a new password for your LensRewards account.",
        back: "Request a new link",
        h1: "New password",
        sub: "Choose a strong password. You can then sign in to the extension with your email and the new password.",
        passwordLabel: "New password",
        passwordPlaceholder: "At least 8 characters",
        confirmLabel: "Confirm password",
        confirmPlaceholder: "Repeat your password",
        strengthEmpty: "Strength: —",
        strengthWeak: "Strength: low",
        strengthMedium: "Strength: medium",
        strengthStrong: "Strength: high",
        submitBtn: "Save password",
        errTokenMissing: "Invalid link: recovery token is missing. Request a new link from the recovery page.",
        errPasswordMin: "Password must be at least 8 characters.",
        errPasswordMismatch: "Passwords do not match.",
        errPasswordWeak: "Password is too weak.",
        errTokenExpired: "This link has expired. Request a new one.",
        errTokenUsed: "This link has already been used. Request a new one if needed.",
        errTokenInvalid: "Invalid link. Request a new recovery link.",
        errConnection: "Connection error. Please try again.",
        errGeneric: "We could not reset your password.",
        saving: "Saving password…",
        successDefault: "Password updated successfully",
        linkFirstSteps: "Go to getting started",
        linkHome: "Back to home",
      },
    },
  };

  var state = { lang: "es", page: "forgot", basePath: "./" };

  function normalizeLang(raw) {
    var v = String(raw || "").toLowerCase().split("-")[0];
    return SUPPORTED.indexOf(v) >= 0 ? v : "es";
  }

  function detectLang() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q) return normalizeLang(q);
    } catch (e) {}
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return normalizeLang(stored);
    } catch (e2) {}
    var nav = (navigator.language || navigator.userLanguage || "es").toLowerCase();
    return nav.indexOf("en") === 0 ? "en" : "es";
  }

  function lookup(key) {
    var pack = STRINGS[state.lang] && STRINGS[state.lang][state.page];
    if (pack && pack[key] != null) return pack[key];
    var common = STRINGS[state.lang] && STRINGS[state.lang].common;
    if (common && common[key] != null) return common[key];
    var fallback = STRINGS.es[state.page];
    return (fallback && fallback[key]) || key;
  }

  function syncUrlLang() {
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.get("lang") !== state.lang) {
        url.searchParams.set("lang", state.lang);
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch (e) {}
  }

  function applyDom() {
    document.documentElement.lang = state.lang;
    var titleEl = document.querySelector("title");
    if (titleEl) titleEl.textContent = lookup("metaTitle");
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", lookup("metaDescription"));

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = lookup(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      el.setAttribute("placeholder", lookup(key));
    });
    document.querySelectorAll("[data-i18n-href]").forEach(function (el) {
      var pathKey = el.getAttribute("data-i18n-href");
      if (!pathKey) return;
      var paths = {
        back: state.page === "reset" ? state.basePath + "olvide-contrasena.html" : state.basePath + "primeros-pasos.html",
        home: state.basePath + "index.html",
        forgot: state.basePath + "olvide-contrasena.html",
        firstSteps: state.basePath + "primeros-pasos.html?from=password-reset",
      };
      if (paths[pathKey]) el.setAttribute("href", paths[pathKey]);
    });

    var langSelect = document.getElementById("page-lang");
    if (langSelect) langSelect.value = state.lang;
  }

  function setLang(lang) {
    state.lang = normalizeLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY, state.lang);
    } catch (e) {}
    syncUrlLang();
    applyDom();
  }

  function init(opts) {
    state.page = opts && opts.page === "reset" ? "reset" : "forgot";
    state.basePath = opts && opts.basePath ? opts.basePath : "./";
    state.lang = detectLang();
    try {
      localStorage.setItem(STORAGE_KEY, state.lang);
    } catch (e) {}
    syncUrlLang();
    applyDom();

    var langSelect = document.getElementById("page-lang");
    if (langSelect) {
      langSelect.addEventListener("change", function (ev) {
        setLang(ev.target.value);
      });
    }

    return {
      lang: function () {
        return state.lang;
      },
      t: lookup,
      setLang: setLang,
      applyDom: applyDom,
    };
  }

  global.LensAuthI18n = { init: init, setLang: setLang };
})(typeof window !== "undefined" ? window : this);
