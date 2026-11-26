import { hasLabel, label as t } from "@/lib/labels";

/** Badge tone per status (components/ui/Badge tones; "danger" is styled by ReportRequestStatusBadge). */
export const REPORT_REQUEST_STATUS_TONE = {
  unassigned: "warning",
  pending: "warning",
  delivered: "success",
  declined: "danger",
  expired: "neutral",
  cancelled: "neutral",
  refunded: "brand",
};

/** Statuses where the price went back to the wallet. */
export const REPORT_REFUNDED_STATUSES = ["declined", "expired", "cancelled", "refunded"];

export const reportRequestStatusLabel = (status) => (hasLabel(`reportRequests.status.${status}`) ? t(`reportRequests.status.${status}`) : status);

/** "Rahul" / "Rahul & Priya" */
export const forNamesText = (names) => (names || []).filter(Boolean).join(" & ");

/** User-facing text for an API error: known codes have their own text, else the server's message. */
export function reportRequestErrorText(err) {
  const code = err?.code;
  if (code && hasLabel(`reportRequests.errors.${code}`)) {
    // The server's validation / profile messages are more specific ("This report needs two people")
    if (["VALIDATION_ERROR", "PROFILES_REQUIRED"].includes(code) && err?.message) return err.message;
    return t(`reportRequests.errors.${code}`);
  }
  if (!err?.status) return "Couldn't reach the server. Check your connection and try again.";
  return err?.message || "Something went wrong. Please try again.";
}

/** Delivery time for people: 24 → "1 day", 72 → "3 days", 30 → "30 hours". */
export function deliveryText(hours) {
  const h = Math.max(1, Math.round(Number(hours) || 0));
  if (h >= 24 && h % 24 === 0) return h === 24 ? "1 day" : `${h / 24} days`;
  return h === 1 ? "1 hour" : `${h} hours`;
}
