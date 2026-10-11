import { PAGE_LANGUAGE } from "../config";

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

  // Translate in place through the widget's <select>. It appears ~1 s after page load, and its
  // language options are filled in a moment later — setting the value before the option exists
  // silently does nothing, so wait for the option itself. Only if the widget never becomes ready
  // (e.g. Google blocked) fall back to a reload, which applies the cookie on load.
  let tries = 0;
  const apply = () => {
    const combo = document.querySelector(".goog-te-combo");
    const ready = combo && [...combo.options].some((o) => o.value === code);
    if (ready) {
      combo.value = code;
      combo.dispatchEvent(new Event("change"));
    } else if (++tries < 60) {
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
