"use client";

import { useState } from "react";
import { ChevronRight, Clock, FilePen, FileText, Sparkles } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { AccountFilterChips } from "@/features/account/components/AccountControls";
import { AccountShell } from "@/features/account/components/AccountShell";
import { AccountEmptyCard, AccountErrorState, AccountListSkeleton, AccountLoadMore } from "@/features/account/components/AccountStates";
import { usePagedResource } from "@/features/account/hooks/usePagedResource";
import { formatShortDate } from "@/features/account/lib/format";
import { useNow } from "@/features/remedies/hooks/useRemedyLive";
import { timeLeftText } from "@/features/remedies/lib/remedies";
import { REPORT_REQUEST_OPEN, REPORT_REQUEST_TABS, reportRequestService } from "@/lib/api/services/reportRequest.service";
import { label as t } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { useReportRequestUpdates } from "../hooks/useReportRequestUpdates";
import { forNamesText } from "../lib/reportRequests";
import { ReportRequestStatusBadge } from "./ReportRequestStatusBadge";

const EMPTY = {
  open: { title: "Nothing being written", description: "Reports you order from astrologers show here until they are delivered." },
  done: { title: "Nothing here yet", description: "Delivered, cancelled and refunded reports show here." },
};

function RequestRow({ request: r, now }) {
  const locale = SITE_LOCALE;
  const open = REPORT_REQUEST_OPEN.includes(r.status);
  const left = open && now && r.dueAt ? new Date(r.dueAt).getTime() - now : null;
  const who = r.astrologer?.name || (r.chosenBy === "team" ? "Any expert" : "Astrologer");
  const forText = forNamesText(r.forNames);

  return (
    <li>
      <LocaleLink
        href={routes.reportRequest(r.id)}
        className={cn(
          "flex gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgb(120_53_15/0.04)] transition-colors hover:border-brand-200 dark:hover:border-brand-700",
          r.unread && "bg-brand-50/60 dark:bg-brand-800/30"
        )}
      >
        {r.astrologer ? (
          <Avatar src={r.astrologer.avatar} name={who} size={44} />
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-300">
            <Sparkles className="size-5" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <p className={cn("flex min-w-0 items-center gap-2", r.unread ? "font-bold" : "font-semibold")}>
              {r.unread && (
                <span className="size-2.5 shrink-0 rounded-full bg-brand-500 dark:bg-gold-400">
                  <span className="sr-only">New</span>
                </span>
              )}
              <span className="truncate">{r.product?.title || "Report"}</span>
            </p>
            <ReportRequestStatusBadge status={r.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted">{[`By ${who}`, forText && `For ${forText}`, formatShortDate(r.createdAt, locale)].filter(Boolean).join(" · ")}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span className="tabular-nums">{formatCurrency(r.price, locale)}</span>
            {left !== null && left > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Clock className="size-3.5" aria-hidden /> {`Due in ${timeLeftText(left)}`}
              </span>
            )}
            {r.status === "delivered" && r.report?.hasPdf && (
              <span className="inline-flex items-center gap-1">
                <FileText className="size-3.5" aria-hidden /> PDF included
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="mt-3 size-4 shrink-0 text-muted" aria-hidden />
      </LocaleLink>
    </li>
  );
}

/** /account/report-requests: reports ordered from astrologers (Open / Done). */
export function MyReportRequestsView() {
  const [tab, setTab] = useState("open");
  const list = usePagedResource((page) => reportRequestService.list({ status: tab, page }), tab);
  const { status, reload, refresh } = list;
  const now = useNow();
  const unread = list.meta?.unread || 0;

  // Delivered / refunded while this page is open, or the tab came back into view
  useReportRequestUpdates(() => refresh());

  return (
    <AccountShell
      title="Reports from astrologers"
      subtitle="Reports written for you by our astrologers."
      actions={
        <>
          <ButtonLink href={routes.myReports} variant="ghost" size="sm">
            Older reports
          </ButtonLink>
          <ButtonLink href={routes.reports} variant="outline" size="sm">
            Get a report
          </ButtonLink>
        </>
      }
    >
      <AccountFilterChips
        className="mb-4"
        label="Reports from astrologers"
        value={tab}
        onChange={setTab}
        options={REPORT_REQUEST_TABS.map((v) => ({ value: v, label: t(`reportRequests.tabs.${v}`) }))}
      />

      {status === "loading" && <AccountListSkeleton rows={3} />}
      {status === "error" && <AccountErrorState onRetry={reload} />}
      {status === "success" && list.items.length === 0 && (
        <AccountEmptyCard
          icon={FilePen}
          title={EMPTY[tab].title}
          description={EMPTY[tab].description}
          action={tab === "open" ? <ButtonLink href={routes.reports}>Browse reports</ButtonLink> : null}
        />
      )}
      {status === "success" && list.items.length > 0 && (
        <>
          <p className="mb-2 text-sm text-muted" aria-live="polite">
            {`${list.total} ${list.total === 1 ? "report" : "reports"}${unread > 0 ? ` · ${unread} new` : ""}`}
          </p>
          <ul className="space-y-3">
            {list.items.map((r) => (
              <RequestRow key={r.id} request={r} now={now} />
            ))}
          </ul>
          <AccountLoadMore list={list} label="Show older reports" />
        </>
      )}

      <Card className="mt-6 flex flex-col items-start gap-2 p-4 text-sm sm:flex-row sm:items-center">
        <p className="flex-1 text-muted">If a report isn&apos;t delivered in time or the astrologer declines, the full amount goes back to your wallet automatically.</p>
        <ButtonLink href={routes.support} size="sm" variant="ghost">
          Get help
        </ButtonLink>
      </Card>
    </AccountShell>
  );
}
