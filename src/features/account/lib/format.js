import { localeTags } from "@/config/locale";
import { formatDate } from "@/lib/utils/format";

const UNITS = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "5 min ago" / "5 मिनट पहले" via Intl — no translation strings needed. */
export function timeAgo(date, locale = "en") {
  const rtf = new Intl.RelativeTimeFormat(localeTags[locale] || "en-IN", { numeric: "auto", style: "short" });
  const diffSec = (new Date(date).getTime() - Date.now()) / 1000;
  for (const [unit, sec] of UNITS) {
    if (Math.abs(diffSec) >= sec) return rtf.format(Math.round(diffSec / sec), unit);
  }
  return rtf.format(0, "minute");
}

export const formatShortDate = (date, locale) => formatDate(date, locale, { day: "numeric", month: "short", year: "numeric" });

export const formatDateTime = (date, locale) =>
  formatDate(date, locale, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export const formatTime = (date, locale) => formatDate(date, locale, { hour: "numeric", minute: "2-digit" });

/** "1993-04-18" (a calendar date, not an instant) → "18 Apr 1993" without timezone shifts. */
export function formatBirthDate(dob, locale) {
  if (!dob) return "";
  const [y, m, d] = dob.split("-").map(Number);
  return new Intl.DateTimeFormat(localeTags[locale] || "en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
}

/** "06:45" → "6:45 am" */
export function formatBirthTime(tob, locale) {
  if (!tob) return "";
  const [h, min] = tob.split(":").map(Number);
  return new Intl.DateTimeFormat(localeTags[locale] || "en-IN", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
    new Date(Date.UTC(2000, 0, 1, h, min))
  );
}

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
