"use client";

import { useState } from "react";
import { Clock, Download, FilePen, FileText, MessageCircleQuestion, RotateCcw, Sparkles, Star, Users } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { AccountConfirmModal, AccountTextarea } from "@/features/account/components/AccountControls";
import { AccountShell } from "@/features/account/components/AccountShell";
import { AccountEmptyCard, AccountErrorState } from "@/features/account/components/AccountStates";
import { useAccountResource } from "@/features/account/hooks/useAccountResource";
import { formatDateTime } from "@/features/account/lib/format";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { useNow } from "@/features/remedies/hooks/useRemedyLive";
import { timeLeftText } from "@/features/remedies/lib/remedies";
import { REPORT_REVIEW_MAX, reportRequestService } from "@/lib/api/services/reportRequest.service";
import { hasLabel, label as t } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { RatingStars } from "@/components/ui/RatingStars";
import { Skeleton } from "@/components/ui/Skeleton";
import { useReportRequestUpdates } from "../hooks/useReportRequestUpdates";
import { REPORT_REFUNDED_STATUSES, forNamesText, reportRequestErrorText } from "../lib/reportRequests";
import { ReportRequestStatusBadge } from "./ReportRequestStatusBadge";

const SectionTitle = ({ icon: Icon, children }) => (
  <h2 className="mb-3 flex items-center gap-2 font-semibold">
    <Icon className="size-4 text-brand-500 dark:text-gold-400" aria-hidden /> {children}
  </h2>
);

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
    </div>
  );
}

function RatingCard({ request: r, onSaved }) {
  const { toast } = useToast();
  const [stars, setStars] = useState(0); // starts empty: the user must choose
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [busy, setBusy] = useState(false);

  if (r.rating) {
    return (
      <Card className="p-5">
        <SectionTitle icon={Star}>Your rating</SectionTitle>
        <RatingStars value={r.rating} size={18} />
        {r.review && <p className="mt-2 whitespace-pre-line break-words text-sm text-muted">{r.review}</p>}
      </Card>
    );
  }
  if (!r.canRate) return null;

  const submit = async () => {
    if (!stars || busy) return;
    setBusy(true);
    try {
      onSaved(await reportRequestService.rate(r.id, { rating: stars, review: review.trim() || undefined }));
      toast({ type: "success", title: "Thanks for your rating" });
    } catch (e) {
      toast({ type: "error", title: "Couldn't save your rating", message: reportRequestErrorText(e) });
      if (e?.code === "CANNOT_RATE") onSaved(null);
    } finally {
      setBusy(false);
    }
  };

  const shown = hover || stars;
  return (
    <Card className="p-5">
      <SectionTitle icon={Star}>Rate this report</SectionTitle>
      <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
            onClick={() => setStars(n)}
            onMouseEnter={() => setHover(n)}
            className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Star className={cn("size-7 transition-colors", n <= shown ? "fill-gold-500 text-gold-500" : "text-line")} aria-hidden />
          </button>
        ))}
      </div>
      {!stars && <p className="mt-1 text-xs text-muted">Tap a star to rate.</p>}
      <AccountTextarea
        aria-label="Review (optional)"
        value={review}
        maxLength={REPORT_REVIEW_MAX}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write a short review (optional)"
        className="mt-3 min-h-20"
      />
      <div className="mt-1 text-right text-xs tabular-nums text-muted">{`${review.length}/${REPORT_REVIEW_MAX}`}</div>
      <Button className="mt-2" size="sm" onClick={submit} loading={busy} disabled={!stars}>
        Submit rating
      </Button>
    </Card>
  );
}

function RefundInfo({ request: r }) {
  const locale = SITE_LOCALE;
  const by = r.refund?.by && hasLabel(`reportRequests.refundBy.${r.refund.by}`) ? t(`reportRequests.refundBy.${r.refund.by}`) : "Refunded";
  const heading =
    r.status === "declined"
      ? "The astrologer declined this report"
      : r.status === "expired"
        ? "The report wasn't delivered in time"
        : r.status === "cancelled"
          ? "You cancelled this report"
          : "This report was refunded";
  return (
    <Card className="p-5">
      <SectionTitle icon={RotateCcw}>{heading}</SectionTitle>
      {r.status === "declined" && r.declineReason && (
        <div className="mb-3 rounded-xl bg-surface-muted p-3 text-sm">
          <p className="text-xs font-semibold text-muted">Reason</p>
          <p className="mt-0.5 whitespace-pre-line break-words">{r.declineReason}</p>
        </div>
      )}
      {r.refund ? (
        <p className="text-sm">
          <span className="font-semibold text-green-700 dark:text-green-400">{`${formatCurrency(r.refund.amount, locale)} returned to your wallet`}</span>
          <span className="text-muted">{` · ${by}${r.refund.at ? ` on ${formatDateTime(r.refund.at, locale)}` : ""}`}</span>
        </p>
      ) : (
        <p className="text-sm text-muted">The full amount is being returned to your wallet.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <ButtonLink href={routes.walletTransactions} size="sm" variant="outline">
          See wallet history
        </ButtonLink>
        {r.product?.slug && (
          <ButtonLink href={routes.report(r.product.slug)} size="sm" variant="ghost">
            Order again
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

/** /account/report-requests/[id]: one ordered report with its text, PDF, cancel, rating and refund. */
export function ReportRequestDetailView({ id }) {
  const locale = SITE_LOCALE;
  const { setUser } = useAuth();
  const { toast } = useToast();
  const { data: r, status, error, reload, refresh, mutate } = useAccountResource(() => reportRequestService.get(id), id);
  const now = useNow();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useReportRequestUpdates((reportRequestId) => {
    if (!reportRequestId || reportRequestId === id) refresh();
  });

  // A write answered with the updated request, or null when it should be re-read
  const onSaved = (next) => (next ? mutate(next) : refresh());
  const back = { href: routes.myReportRequests, label: "Reports from astrologers" };

  if (status === "loading")
    return (
      <AccountShell back={back}>
        <DetailSkeleton />
      </AccountShell>
    );
  if (status === "error") {
    return (
      <AccountShell back={back}>
        {[400, 404, 422].includes(error?.status) ? (
          <AccountEmptyCard
            icon={FilePen}
            title="Report not found"
            description="This report doesn't exist or belongs to another account."
            action={<ButtonLink href={routes.myReportRequests}>Reports from astrologers</ButtonLink>}
          />
        ) : (
          <AccountErrorState onRetry={reload} />
        )}
      </AccountShell>
    );
  }

  const cancel = async () => {
    setCancelling(true);
    try {
      const next = await reportRequestService.cancel(r.id);
      mutate(next);
      setConfirmCancel(false);
      toast({ type: "success", title: "Report cancelled", message: `${formatCurrency(r.price, locale)} is back in your wallet.` });
      // Header balance: add the refund locally (the next wallet read confirms it)
      if (next?.refund?.amount) setUser((u) => (u ? { ...u, walletBalance: Math.round(((u.walletBalance || 0) + next.refund.amount) * 100) / 100 } : u));
    } catch (e) {
      setConfirmCancel(false);
      toast({ type: "error", title: "Couldn't cancel", message: reportRequestErrorText(e) });
      if (e?.code === "CANNOT_CANCEL") refresh();
    } finally {
      setCancelling(false);
    }
  };

  const open = r.status === "unassigned" || r.status === "pending";
  const left = open && now && r.dueAt ? new Date(r.dueAt).getTime() - now : null;
  const delivered = r.status === "delivered" && r.report;
  const team = !r.astrologer;
  const astroName = r.astrologer?.name || "Any expert";
  const astroLink = r.astrologer?.slug ? routes.astrologer(r.astrologer.slug) : null;
  const title = r.product?.title || "Report";
  const pdfUrl = delivered && r.report.hasPdf ? reportRequestService.pdfUrl(r) : null;
  const pdfName = r.report?.pdfName || `${r.product?.slug || "report"}-${r.code || r.id}.pdf`;

  const pdfButton = pdfUrl ? (
    <a href={pdfUrl} download={pdfName} target="_blank" rel="noopener" className={buttonClasses({ variant: "outline", size: "sm" })}>
      <Download className="size-4" aria-hidden /> Download PDF
    </a>
  ) : null;

  return (
    <AccountShell back={back} title={title} subtitle={r.code ? `Order ${r.code}` : undefined} actions={pdfButton}>
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            {team ? (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-300">
                <Sparkles className="size-6" aria-hidden />
              </span>
            ) : astroLink ? (
              <LocaleLink href={astroLink} className="shrink-0">
                <Avatar src={r.astrologer?.avatar} name={astroName} size={48} />
              </LocaleLink>
            ) : (
              <Avatar src={r.astrologer?.avatar} name={astroName} size={48} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                {astroLink ? (
                  <LocaleLink href={astroLink} className="min-w-0 truncate font-semibold hover:text-brand-600 dark:hover:text-gold-400">
                    {astroName}
                  </LocaleLink>
                ) : (
                  <p className="min-w-0 truncate font-semibold">{astroName}</p>
                )}
                <ReportRequestStatusBadge status={r.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted">{team ? "Our team is choosing the best available astrologer for you." : r.chosenBy === "team" ? "Chosen for you by our team" : "Astrologer"}</p>
              <p className="mt-0.5 text-xs text-muted">{`Ordered ${formatDateTime(r.createdAt, locale)} · ${formatCurrency(r.price, locale)}`}</p>
            </div>
          </div>

          {open && (
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <p className="flex items-center gap-2 font-semibold">
                <Clock className="size-4 shrink-0" aria-hidden />
                {left === null ? "Your report is being prepared" : left > 0 ? `Due in ${timeLeftText(left)}` : "Delivery time is over. Your refund is on its way."}
              </p>
              {r.dueAt && <p className="mt-1 text-xs">{`Expected by ${formatDateTime(r.dueAt, locale)}. If it isn't delivered by then, the full amount comes back to your wallet automatically.`}</p>}
            </div>
          )}
          {open && r.canCancel && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">You can cancel until the astrologer opens your request.</p>
              <Button variant="outline" size="sm" onClick={() => setConfirmCancel(true)}>
                Cancel report
              </Button>
            </div>
          )}
          {open && !r.canCancel && <p className="mt-3 text-xs text-muted">The astrologer has opened your request and is working on it.</p>}
        </Card>

        <Card className="p-5">
          <SectionTitle icon={Users}>Report for</SectionTitle>
          <p className="text-sm font-medium">{forNamesText(r.forNames) || "You"}</p>
          {r.question && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <MessageCircleQuestion className="size-3.5" aria-hidden /> Your question
              </p>
              <p className="whitespace-pre-line break-words text-sm">{r.question}</p>
            </div>
          )}
        </Card>

        {delivered && (
          <Card className="p-5">
            <SectionTitle icon={FileText}>{`Your report${r.astrologer?.name ? ` from ${r.astrologer.name}` : ""}`}</SectionTitle>
            {r.deliveredAt && <p className="-mt-2 mb-3 text-xs text-muted">{`Delivered ${formatDateTime(r.deliveredAt, locale)}`}</p>}
            {r.report.text && <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{r.report.text}</div>}
            {pdfUrl && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-surface-muted p-3">
                <FileText className="size-5 shrink-0 text-brand-500 dark:text-gold-400" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.report.pdfName || "Report PDF"}</span>
                <a href={pdfUrl} download={pdfName} target="_blank" rel="noopener" className={buttonClasses({ variant: "gold", size: "sm" })}>
                  <Download className="size-4" aria-hidden /> Download PDF
                </a>
              </div>
            )}
            <p className="mt-4 text-xs text-muted">Reports are guidance based on astrology. For health, legal or money matters, please also consult a qualified professional.</p>
          </Card>
        )}

        {REPORT_REFUNDED_STATUSES.includes(r.status) && <RefundInfo request={r} />}

        {r.status === "delivered" && <RatingCard key={`rt-${r.rating || 0}`} request={r} onSaved={onSaved} />}
      </div>

      <AccountConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancel}
        loading={cancelling}
        title="Cancel this report?"
        description={`${formatCurrency(r.price, locale)} will go back to your wallet right away.`}
        confirmLabel="Yes, cancel"
      />
    </AccountShell>
  );
}
