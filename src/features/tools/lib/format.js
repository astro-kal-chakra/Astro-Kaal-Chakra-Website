import { localeTags } from "@/config/locale";

export const IST = "Asia/Kolkata";

/** 12.5833 → "12° 35′" */
export function formatDegree(value) {
  const d = Math.floor(value);
  const m = Math.floor((value - d) * 60);
  return `${d}° ${String(m).padStart(2, "0")}′`;
}

/** ISO instant → local clock time, e.g. "6:14 AM". */
export function formatTime(isoString, locale = "en", timeZone = IST) {
  return new Intl.DateTimeFormat(localeTags[locale] || "en-IN", { hour: "numeric", minute: "2-digit", timeZone }).format(
    new Date(isoString)
  );
}

/** "YYYY-MM-DD" of an instant in a timezone. */
export function isoDateIn(date = new Date(), timeZone = IST) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** "YYYY-MM-DD" ± n days. */
export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Format a plain "YYYY-MM-DD" date without timezone drift. */
export function formatPlainDate(dateStr, locale = "en", options = { day: "numeric", month: "long", year: "numeric" }) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat(localeTags[locale] || "en-IN", { timeZone: "UTC", ...options }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
}

/** "HH:MM" (24h) → localized clock time. */
export function formatClock(hhmm, locale = "en") {
  const [h, m] = hhmm.split(":").map(Number);
  return new Intl.DateTimeFormat(localeTags[locale] || "en-IN", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
    new Date(Date.UTC(2000, 0, 1, h, m))
  );
}
