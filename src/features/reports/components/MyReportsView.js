"use client";

import { useEffect, useState } from "react";
import { usePagedResource } from "@/features/account/hooks/usePagedResource";
import { AccountLoadMore } from "@/features/account/components/AccountStates";
import { Download, FileText, Loader2 } from "lucide-react";
import { routes } from "@/config/routes";
import { reportService } from "@/lib/api/services/report.service";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ReportIcon } from "./ReportIcon";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";
import { reportCopy } from "../lib/copy";

const POLL_MS = 5000;

/** /account/reports — purchased reports; polls while any is still generating. */
export function MyReportsView() {
  const list = usePagedResource((page) => reportService.getMyReports({ page }));
  const items = list.status === "loading" ? null : list.items;
  const { refresh } = list;

  // While a report is being prepared, re-read the newest page every few seconds
  useEffect(() => {
    if (!list.items.some((r) => r.status === "generating")) return;
    const timer = setTimeout(refresh, POLL_MS);
    return () => clearTimeout(timer);
  }, [list.items, refresh]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">My reports</h1>
          <p className="mt-1 text-sm text-muted">{"Reports you've purchased. Download them anytime."}</p>
        </div>
        <ButtonLink href={routes.reports} variant="outline" size="sm">
          Browse reports
        </ButtonLink>
      </div>

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="Get a detailed Kundli, marriage matching or yearly prediction report prepared just for you."
            action={
              <ButtonLink href={routes.reports} variant="gold">
                Browse reports
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <MyReportRow key={r.id} report={r} />
          ))}
        </ul>
      )}
      {items !== null && <AccountLoadMore list={list} />}
    </div>
  );
}

function MyReportRow({ report: r }) {
  const locale = SITE_LOCALE;
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    reportService
      .getDownloadUrl(r.id)
      .then(({ url, filename, revoke }) => {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000);
      })
      .catch(() => toast({ type: "error", title: "Couldn't download the report. Please try again." }))
      .finally(() => setDownloading(false));
  };

  return (
    <Card as="li" className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <ReportIcon icon={r.icon} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{reportCopy(r).title}</p>
          <p className="truncate text-sm text-muted">{`For ${r.profileNames.join(" & ")}`}</p>
          <p className="text-xs text-muted">
            {`Purchased ${formatDate(r.purchasedAt, locale)} · ${formatCurrency(r.price, locale)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {r.status === "ready" && <Badge tone="success">Ready</Badge>}
        {r.status === "generating" && (
          <Badge tone="warning">
            <Loader2 className="size-3 animate-spin" aria-hidden /> Generating
          </Badge>
        )}
        {r.status === "failed" && (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">Failed</Badge>
        )}
        {r.status === "ready" ? (
          <Button size="sm" variant="primary" loading={downloading} onClick={download}>
            {!downloading && <Download className="size-4" aria-hidden />} Download
          </Button>
        ) : r.status === "generating" ? (
          <span className="text-xs text-muted">Usually ready in a few hours</span>
        ) : (
          <ButtonLink href={routes.support} size="sm" variant="outline">
            Contact support
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}
