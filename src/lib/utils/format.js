import { localeTags } from "@/config/locale";

/**
 * Rupees with paise only when there are any: 36.2 -> "₹36.20", 36 -> "₹36", 100000 -> "₹1,00,000".
 * Rounds to the paisa first so float noise (36.199999) never shows.
 */
export function formatCurrency(amount, locale = "en") {
  const paise = Math.round((Number(amount) || 0) * 100);
  const digits = paise % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat(localeTags[locale] || "en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(paise / 100);
}

export function formatCompact(n, locale = "en") {
  return new Intl.NumberFormat(localeTags[locale] || "en-IN", { notation: "compact" }).format(n);
}

export function formatDate(date, locale = "en", options = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat(localeTags[locale] || "en-IN", { timeZone: "Asia/Kolkata", ...options }).format(
    new Date(date)
  );
}

/** 125 -> "02:05" */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Mask a phone for display: 9876543210 -> 98XXXXXX10 */
export const maskPhone = (phone = "") => phone.replace(/^(\d{2})\d+(\d{2})$/, "$1XXXXXX$2");
