import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { REPORT_REQUEST_STATUS_TONE, reportRequestStatusLabel } from "../lib/reportRequests";

/** Status pill for a report request (unassigned, pending, delivered, declined, expired, cancelled, refunded). */
export function ReportRequestStatusBadge({ status, className }) {
  const tone = REPORT_REQUEST_STATUS_TONE[status] || "neutral";
  return (
    <Badge
      tone={tone === "danger" ? undefined : tone}
      className={cn(tone === "danger" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", className)}
    >
      {reportRequestStatusLabel(status)}
    </Badge>
  );
}
