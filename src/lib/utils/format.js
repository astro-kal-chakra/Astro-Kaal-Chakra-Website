import { localeTags } from "@/config/locale";

export function formatCurrency(amount, locale = "en") {
  return new Intl.NumberFormat(localeTags[locale] || "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
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
