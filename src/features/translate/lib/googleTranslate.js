import { PAGE_LANGUAGE, TRANSLATE_LANGUAGES } from "../config";

/**
 * Thin wrapper around the Google Website Translator widget.
 * Google reads/writes the `googtrans` cookie ("/en/hi"); the hidden widget's
 * <select class="goog-te-combo"> performs the translation in place.
 */
const COOKIE = "googtrans";
const CHANGE_EVENT = "translate:change";

export function getCurrentLanguage() {
  if (typeof document === "undefined") return PAGE_LANGUAGE;
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/;]*\/([^;]+)/);
  return match ? decodeURIComponent(match[1]) : PAGE_LANGUAGE;
}

/** Google may set the cookie on the bare host and the parent domain — write/clear all variants. */
function writeCookie(value) {
  const expire = value ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const v = value || "";
  const host = location.hostname;
  document.cookie = `${COOKIE}=${v}; path=/${expire}`;
  if (host.includes(".")) {
    document.cookie = `${COOKIE}=${v}; path=/; domain=${host}${expire}`;
    document.cookie = `${COOKIE}=${v}; path=/; domain=.${host.split(".").slice(-2).join(".")}${expire}`;
  }
}

/**
 * Load Google's translator (~110 KB) on demand: only for visitors who chose another language, or the moment
 * someone reaches for the language switch. Most visitors read the site in English and never download it.
 * Safe to call any number of times.
 */
export function loadTranslate() {
  if (typeof window === "undefined" || window.google?.translate || document.getElementById("google-translate-script")) return;

  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: PAGE_LANGUAGE,
        includedLanguages: TRANSLATE_LANGUAGES.map((l) => l.code).join(","),
        autoDisplay: false,
        // Default layout on purpose: it renders the <select class="goog-te-combo"> that setLanguage() drives.
        // (The SIMPLE layout has no select, so every switch fell back to a full page reload.)
      },
      "google_translate_element"
    );
    // Google's widget injects (and re-renders) small icon images with missing or empty alt text, which SEO checkers flag:
    // label every one as soon as it appears.
    // (Some sit in the widget, one in Google's translation tooltip #goog-gt-tt, which it appends to <body>.)
    const host = document.getElementById("google_translate_element");
    const label = () =>
      document
        .querySelectorAll("#google_translate_element img:not([alt]), #google_translate_element img[alt=\"\"], #goog-gt-tt img:not([alt]), #goog-gt-tt img[alt=\"\"]")
        .forEach((img) => img.setAttribute("alt", "Google Translate"));
    label();
    if (host) new MutationObserver(label).observe(host, { childList: true, subtree: true });
    new MutationObserver(label).observe(document.body, { childList: true }); // body's direct children only: cheap
  };

  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export function subscribeLanguage(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export function setLanguage(code) {
  if (code === getCurrentLanguage()) return;

  // Back to the original language: restore in place (instant), reload only as a last resort.
  if (code === PAGE_LANGUAGE) {
    writeCookie(null);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    if (!restoreOriginal()) location.reload();
    return;
  }

  writeCookie(`/${PAGE_LANGUAGE}/${code}`);
  window.dispatchEvent(new Event(CHANGE_EVENT));
  loadTranslate(); // usually already loading: the switch starts it on hover / focus / touch

  // Translate in place through the widget's <select>. It appears ~1 s after the script loads, and its
  // language options are filled in a moment later — setting the value before the option exists
  // silently does nothing, so wait for the option itself (up to 12 s, for slow mobile networks). Only if
  // the widget never becomes ready (e.g. Google blocked) fall back to a reload, which applies the cookie on load.
  let tries = 0;
  const apply = () => {
    const combo = document.querySelector(".goog-te-combo");
    const ready = combo && [...combo.options].some((o) => o.value === code);
    if (ready) {
      combo.value = code;
      combo.dispatchEvent(new Event("change"));
    } else if (++tries < 120) {
      setTimeout(apply, 100);
    } else {
      location.reload();
    }
  };
  apply();
}

/**
 * Show the original page without reloading, by clicking the "Show original" button in Google's
 * (visually hidden) translate bar — Google's own restore, so its state stays clean: it clears the
 * cookie itself and later switches translate normally again.
 * (Selecting the page language in the widget's <select> also restores, but leaves Google in a state
 * where the next switch is ignored — don't use it.)
 * @returns {boolean} false if the bar isn't available (caller reloads)
 */
function restoreOriginal() {
  for (const frame of document.querySelectorAll("iframe.skiptranslate")) {
    try {
      const button = frame.contentDocument?.querySelector('[id$=".restore"]');
      if (button) {
        button.click();
        return true;
      }
    } catch {
      // cross-origin frame — skip
    }
  }
  return false;
}

/**
 * Google Translate replaces text nodes with <font> wrappers, which makes React
 * throw on removeChild/insertBefore during re-renders. Make those calls tolerant.
 * See https://github.com/facebook/react/issues/11538
 */
export function installDomGuard() {
  if (typeof Node !== "function" || Node.prototype.__translateGuard) return;
  Node.prototype.__translateGuard = true;

  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child);
  };

  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return insertBefore.call(this, newNode, referenceNode);
  };
}
