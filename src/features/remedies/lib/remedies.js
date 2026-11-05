import { BookOpenText, CircleDot, Flame, Gem, HandHeart, Hexagon, Leaf, Music, Shapes, UtensilsCrossed } from "lucide-react";
import { hasLabel, label as t } from "@/lib/labels";

/** Badge tone per status (components/ui/Badge tones; "danger" is styled by RemedyStatusBadge). */
export const REMEDY_STATUS_TONE = {
  pending: "warning",
  delivered: "success",
  declined: "danger",
  expired: "neutral",
  cancelled: "neutral",
  refunded: "brand",
};

/** Statuses where the price went back to the wallet. */
export const REFUNDED_STATUSES = ["declined", "expired", "cancelled", "refunded"];

/** Icon per remedy item type. */
export const REMEDY_ITEM_ICONS = {
  mantra: Music,
  puja: Flame,
  gemstone: Gem,
  rudraksha: CircleDot,
  yantra: Hexagon,
  donation: HandHeart,
  fasting: UtensilsCrossed,
  lal_kitab: BookOpenText,
  lifestyle: Leaf,
  other: Shapes,
};

export const remedyStatusLabel = (status) => (hasLabel(`remedies.status.${status}`) ? t(`remedies.status.${status}`) : status);

export const remedyItemTypeLabel = (type) => (hasLabel(`remedies.itemType.${type}`) ? t(`remedies.itemType.${type}`) : t("remedies.itemType.other"));

/** User-facing text for an API error: known codes have their own text, else the server's message. */
export function remedyErrorText(err) {
  const code = err?.code;
  if (code && hasLabel(`remedies.errors.${code}`)) {
    // Validation messages from the server are specific ("Please describe your problem in a few words")
    if (code === "VALIDATION_ERROR" && err?.message) return err.message;
    return t(`remedies.errors.${code}`);
  }
  if (!err?.status) return "Couldn't reach the server. Check your connection and try again.";
  return err?.message || "Something went wrong. Please try again.";
}

/** "2d 5h" / "5h 12m" / "12m" left until `until` (ms). */
export function timeLeftText(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
