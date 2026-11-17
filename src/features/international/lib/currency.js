/**
 * International users (customers outside India) see prices in US dollars; everyone else in rupees.
 * The backend decides: a signed-in user's own amounts (wallet, packs, orders, history...) come in their
 * account currency; public lists (astrologers, gifts, reports) carry both the rupee price and a `usd` one.
 */

export const INR = "INR";
export const USD = "USD";

/** Remembers the visitor's country check for a week, so later pages show the right prices at once. */
export const CURRENCY_COOKIE = "akc_ccy";

export function readCurrencyCookie() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=(INR|USD)`));
  return m ? m[1] : null;
}

export function writeCurrencyCookie(currency) {
  if (typeof document === "undefined") return;
  document.cookie = `${CURRENCY_COOKIE}=${currency}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

/**
 * Per-minute price of `mode` (chat | call | video) for this viewer.
 * Rupee viewers: the normal price. Dollar viewers: the astrologer's foreign price (`usd`), sent by the backend.
 */
export function modePrice(astrologer, mode, currency) {
  if (!astrologer) return 0;
  if (currency === USD) return astrologer.usd?.[mode] ?? 0;
  if (mode === "call") return astrologer.callPrice ?? astrologer.voicePrice ?? astrologer.chatPrice;
  return mode === "chat" ? astrologer.chatPrice : astrologer.videoPrice;
}

/** A catalogue item's price for this viewer (gifts, reports): `priceUsd` for dollar viewers. */
export const itemPrice = (item, currency, field = "price") =>
  currency === USD ? item?.[`${field}Usd`] ?? 0 : item?.[field] ?? 0;

/** Signed in with Google (international users): no login phone; the email is the login. */
export const isGoogleAccount = (user) => user?.authProvider === "google";

/** The contact line under a user's name: "+91 98XXXXXX10", or the Google email (international users). */
export function accountContact(user, maskPhone) {
  if (user?.phone) return `+91 ${maskPhone(user.phone)}`;
  return user?.email || "";
}

/** Optional mobile number with country code for international users: "+1 415 555 0100" (7–15 digits). */
export const CONTACT_PHONE_RE = /^\+?[\d\s()-]{7,22}$/;
export const validContactPhone = (v) => CONTACT_PHONE_RE.test(v) && v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15;
