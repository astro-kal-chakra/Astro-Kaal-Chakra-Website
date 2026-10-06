/**
 * The friend's referral code a visitor arrived with (share link `?ref=CODE`), kept in this browser
 * until they sign up, so it survives browsing around before logging in. 30 days, like the share window.
 */
const KEY = "akc_ref";
const TTL_MS = 30 * 86400000;

/** Same normalisation as the backend: upper-case, no spaces or dashes. */
export const normalizeReferralCode = (code) => String(code || "").toUpperCase().replace(/[\s-]/g, "");
export const isReferralCodeShape = (code) => /^[A-Z0-9]{4,20}$/.test(code);

const listeners = new Set();
/** For useSyncExternalStore: the login form re-reads the code when a share link is captured. */
export function subscribePendingReferral(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const emit = () => listeners.forEach((cb) => cb());

export function rememberReferral(code) {
  const c = normalizeReferralCode(code);
  if (!isReferralCodeShape(c)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ code: c, at: Date.now() }));
  } catch {}
  emit();
}

export function getPendingReferral() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v?.code && Date.now() - v.at < TTL_MS) return v.code;
    localStorage.removeItem(KEY);
  } catch {}
  return "";
}

export function clearPendingReferral() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  emit();
}
