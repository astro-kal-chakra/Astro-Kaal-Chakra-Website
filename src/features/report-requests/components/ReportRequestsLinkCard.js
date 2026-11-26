"use client";

import { ChevronRight, FilePen } from "lucide-react";
import { routes } from "@/config/routes";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { useReportRequestsEnabled } from "../hooks/useReportRequestConfig";

/** On "My reports" (older purchases): a link to reports ordered from astrologers, while that feature is on. */
export function ReportRequestsLinkCard() {
  const enabled = useReportRequestsEnabled();
  if (!enabled) return null;
  return (
    <LocaleLink
      href={routes.myReportRequests}
      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand-200 dark:hover:border-brand-700"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">
        <FilePen className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">Reports from astrologers</span>
        <span className="block text-xs text-muted">Track and read the reports astrologers are writing for you.</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
    </LocaleLink>
  );
}
