"use client";

import { cn } from "@/lib/utils/cn";
import { label as t } from "@/lib/labels";

const DOT = { online: "bg-online animate-pulse-dot", busy: "bg-busy", offline: "bg-offline" };
const TEXT = { online: "text-green-700 dark:text-green-400", busy: "text-amber-700 dark:text-amber-400", offline: "text-muted" };

export function StatusBadge({ status, className }) {
  return (
    <span key={status} className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", TEXT[status], className)}>
      <span className={cn("size-2 rounded-full", DOT[status])} aria-hidden />
      {t(`status.${status}`)}
    </span>
  );
}
