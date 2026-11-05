import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { REMEDY_STATUS_TONE, remedyStatusLabel } from "../lib/remedies";

/** Status pill for a remedy (pending, delivered, declined, expired, cancelled, refunded). */
export function RemedyStatusBadge({ status, className }) {
  const tone = REMEDY_STATUS_TONE[status] || "neutral";
  return (
    <Badge
      tone={tone === "danger" ? undefined : tone}
      className={cn(tone === "danger" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", className)}
    >
      {remedyStatusLabel(status)}
    </Badge>
  );
}
