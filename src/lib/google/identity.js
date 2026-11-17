/**
 * "Sign in with Google" through Google Identity Services (no Firebase). Google shows its own button and
 * account chooser and gives back an ID token (a signed JWT); the backend checks it against our OAuth
 * client ID (POST /web/auth/social) and sets our login cookies.
 * The client ID comes from the backend's site config (international settings), so nothing to set here.
 */

const SCRIPT = "https://accounts.google.com/gsi/client";
let loading = null;

/** Loads Google's script once, only when the Google button is shown. */
export function loadGoogleIdentity() {
  if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.defer = true;
    s.onload = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error("Google sign-in didn't load")));
    s.onerror = () => {
      loading = null; // try again next time
      reject(new Error("Couldn't load Google sign-in. Please check your connection."));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Draws Google's official button into `el`; `onToken(idToken)` runs after the person picks their account.
 * Returns once the button is on screen.
 */
// Google wants initialize() once per page; the button that's on screen now gets the result
let initializedFor = null;
let latestOnToken = null;

export async function renderGoogleButton(el, clientId, onToken, { width } = {}) {
  const gis = await loadGoogleIdentity();
  latestOnToken = onToken;
  if (initializedFor !== clientId) {
    gis.initialize({
      client_id: clientId,
      callback: (res) => res?.credential && latestOnToken?.(res.credential),
      ux_mode: "popup",
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });
    initializedFor = clientId;
  }
  el.innerHTML = "";
  gis.renderButton(el, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "pill",
    logo_alignment: "left",
    ...(width ? { width: Math.min(400, Math.max(200, Math.round(width))) } : {}),
  });
}

/** After signing out: Google won't sign this person straight back in on the next visit. */
export function disableGoogleAutoSelect() {
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {
    /* not loaded */
  }
}
