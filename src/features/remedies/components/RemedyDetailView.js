"use client";

import { useState } from "react";
import { CalendarClock, Clock, HandHeart, MessageCircleQuestion, Printer, RotateCcw, Send, Star } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { siteConfig } from "@/config/site";
import { AccountConfirmModal, AccountTextarea } from "@/features/account/components/AccountControls";
import { AccountShell } from "@/features/account/components/AccountShell";
import { AccountEmptyCard, AccountErrorState } from "@/features/account/components/AccountStates";
import { useAccountResource } from "@/features/account/hooks/useAccountResource";
import { formatDateTime } from "@/features/account/lib/format";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { REMEDY_FOLLOW_UP_MAX, REMEDY_FOLLOW_UP_MIN, REMEDY_REVIEW_MAX, remedyService } from "@/lib/api/services/remedy.service";
import { categoryLabel, hasLabel, label as t } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { RatingStars } from "@/components/ui/RatingStars";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNow, useRemedyUpdates } from "../hooks/useRemedyLive";
import { REFUNDED_STATUSES, REMEDY_ITEM_ICONS, remedyErrorText, remedyItemTypeLabel, timeLeftText } from "../lib/remedies";
import { RemedyStatusBadge } from "./RemedyStatusBadge";

/** Printing shows only the remedy sheet, in plain black on white. */
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #remedy-print, #remedy-print * { visibility: visible !important; }
  #remedy-print { position: absolute; inset: 0 auto auto 0; width: 100%; margin: 0; padding: 0; border: 0; box-shadow: none; background: #fff !important; color: #000 !important; }
  #remedy-print * { color: #000 !important; background: transparent !important; border-color: #bbb !important; box-shadow: none !important; }
  #remedy-print .remedy-print-item { break-inside: avoid; }
  @page { margin: 16mm; }
}
`;

const SectionTitle = ({ icon: Icon, children }) => (
  <h2 className="mb-3 flex items-center gap-2 font-semibold">
    <Icon className="size-4 text-brand-500 dark:text-gold-400" aria-hidden /> {children}
  </h2>
);

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}

function RemedyItemCard({ item }) {
  const Icon = REMEDY_ITEM_ICONS[item.type] || REMEDY_ITEM_ICONS.other;
  return (
    <li className="remedy-print-item rounded-xl border border-line bg-surface-muted/60 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{remedyItemTypeLabel(item.type)}</p>
          <p className="break-words font-semibold">{item.title}</p>
          {item.details && <p className="mt-1 whitespace-pre-line break-words text-sm text-muted">{item.details}</p>}
          {(item.when || item.duration) && (
            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {item.when && (
                <div className="flex min-w-0 items-start gap-1.5">
                  <dt className="flex shrink-0 items-center gap-1 text-muted">
                    <CalendarClock className="size-3.5" aria-hidden /> When:
                  </dt>
                  <dd className="min-w-0 break-words font-medium">{item.when}</dd>
                </div>
              )}
              {item.duration && (
                <div className="flex min-w-0 items-start gap-1.5">
                  <dt className="flex shrink-0 items-center gap-1 text-muted">
                    <Clock className="size-3.5" aria-hidden /> For:
                  </dt>
                  <dd className="min-w-0 break-words font-medium">{item.duration}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </li>
  );
}

function FollowUpCard({ remedy: r, onSaved }) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const q = text.trim();
  const valid = q.length >= REMEDY_FOLLOW_UP_MIN && q.length <= REMEDY_FOLLOW_UP_MAX;

  const send = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      onSaved(await remedyService.askFollowUp(r.id, q));
      toast({ type: "success", title: "Question sent", message: `${r.astrologer?.name || "The astrologer"} will answer it here.` });
    } catch (e) {
      setError(remedyErrorText(e));
      if (["FOLLOW_UP_USED", "FOLLOW_UP_CLOSED", "NOT_DELIVERED"].includes(e?.code)) onSaved(null); // re-read the remedy
    } finally {
      setBusy(false);
    }
  };

  if (r.followUp) {
    return (
      <Card className="p-5">
        <SectionTitle icon={MessageCircleQuestion}>Your follow-up question</SectionTitle>
        <p className="whitespace-pre-line break-words text-sm">{r.followUp.question}</p>
        <p className="mt-1 text-xs text-muted">{formatDateTime(r.followUp.askedAt, SITE_LOCALE)}</p>
        <div className="mt-4 rounded-xl bg-surface-muted p-3">
          {r.followUp.answer ? (
            <>
              <p className="text-xs font-semibold text-muted">{`${r.astrologer?.name || "Astrologer"} answered`}</p>
              <p className="mt-1 whitespace-pre-line break-words text-sm">{r.followUp.answer}</p>
              {r.followUp.answeredAt && <p className="mt-1 text-xs text-muted">{formatDateTime(r.followUp.answeredAt, SITE_LOCALE)}</p>}
            </>
          ) : (
            <p className="text-sm text-muted">Waiting for the astrologer&apos;s answer. We&apos;ll notify you.</p>
          )}
        </div>
      </Card>
    );
  }

  if (!r.canFollowUp) return null;

  return (
    <Card className="p-5 print:hidden">
      <SectionTitle icon={MessageCircleQuestion}>Ask a follow-up question</SectionTitle>
      <p className="mb-3 text-sm text-muted">Something not clear? You can ask one free follow-up question about this remedy.</p>
      <AccountTextarea
        id="remedy-follow-up"
        aria-label="Follow-up question"
        value={text}
        maxLength={REMEDY_FOLLOW_UP_MAX}
        onChange={(e) => {
          setError(null);
          setText(e.target.value);
        }}
        placeholder="For example: Can I chant the mantra in the evening instead?"
        className="min-h-24"
      />
      <div className="mt-1 flex justify-between gap-3 text-xs text-muted">
        <span>{error ? <span className="text-red-600 dark:text-red-400" role="alert">{error}</span> : "Only one follow-up question is allowed."}</span>
        <span className="shrink-0 tabular-nums">{`${text.length}/${REMEDY_FOLLOW_UP_MAX}`}</span>
      </div>
      <Button className="mt-3" size="sm" onClick={send} loading={busy} disabled={!valid}>
        {!busy && <Send className="size-3.5" aria-hidden />} Send question
      </Button>
    </Card>
  );
}

function RatingCard({ remedy: r, onSaved }) {
  const { toast } = useToast();
  const [stars, setStars] = useState(0);
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
      onSaved(await remedyService.rate(r.id, { rating: stars, review: review.trim() || undefined }));
      toast({ type: "success", title: "Thanks for your rating" });
    } catch (e) {
      toast({ type: "error", title: "Couldn't save your rating", message: remedyErrorText(e) });
      if (e?.code === "CANNOT_RATE") onSaved(null);
    } finally {
      setBusy(false);
    }
  };

  const shown = hover || stars;
  return (
    <Card className="p-5 print:hidden">
      <SectionTitle icon={Star}>Rate this remedy</SectionTitle>
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
      <AccountTextarea
        aria-label="Review (optional)"
        value={review}
        maxLength={REMEDY_REVIEW_MAX}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write a short review (optional)"
        className="mt-3 min-h-20"
      />
      <div className="mt-1 text-right text-xs tabular-nums text-muted">{`${review.length}/${REMEDY_REVIEW_MAX}`}</div>
      <Button className="mt-2" size="sm" onClick={submit} loading={busy} disabled={!stars}>
        Submit rating
      </Button>
    </Card>
  );
}

function RefundInfo({ remedy: r }) {
  const locale = SITE_LOCALE;
  const by = r.refund?.by && hasLabel(`remedies.refundBy.${r.refund.by}`) ? t(`remedies.refundBy.${r.refund.by}`) : "Refunded";
  const heading =
    r.status === "declined"
      ? "The astrologer declined this request"
      : r.status === "expired"
        ? "The astrologer didn't reply in time"
        : r.status === "cancelled"
          ? "You cancelled this request"
          : "This request was refunded";
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
        {r.astrologer?.slug && (
          <ButtonLink href={routes.astrologer(r.astrologer.slug)} size="sm" variant="ghost">
            Visit astrologer
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

/** /account/remedies/[id]: one remedy request with its answer, follow-up, rating and print. */
export function RemedyDetailView({ id }) {
  const locale = SITE_LOCALE;
  const { setUser } = useAuth();
  const { toast } = useToast();
  const { data: r, status, error, reload, refresh, mutate } = useAccountResource(() => remedyService.get(id), id);
  const now = useNow();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useRemedyUpdates((remedyId) => {
    if (!remedyId || remedyId === id) refresh();
  });

  // A write answered with the updated remedy, or null when it should be re-read
  const onSaved = (next) => (next ? mutate(next) : refresh());

  const back = { href: routes.myRemedies, label: "My remedies" };

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
            icon={HandHeart}
            title="Remedy not found"
            description="This request doesn't exist or belongs to another account."
            action={<ButtonLink href={routes.myRemedies}>My remedies</ButtonLink>}
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
      const next = await remedyService.cancel(r.id);
      mutate(next);
      setConfirmCancel(false);
      toast({ type: "success", title: "Request cancelled", message: `${formatCurrency(r.price, locale)} is back in your wallet.` });
      // Header balance: add the refund locally (the next wallet read confirms it)
      if (next?.refund?.amount) setUser((u) => (u ? { ...u, walletBalance: Math.round(((u.walletBalance || 0) + next.refund.amount) * 100) / 100 } : u));
    } catch (e) {
      setConfirmCancel(false);
      toast({ type: "error", title: "Couldn't cancel", message: remedyErrorText(e) });
      if (e?.code === "CANNOT_CANCEL") refresh();
    } finally {
      setCancelling(false);
    }
  };

  const pending = r.status === "pending";
  const left = pending && now ? new Date(r.dueAt).getTime() - now : null;
  const delivered = r.status === "delivered" && r.remedy;
  const astroName = r.astrologer?.name || "Astrologer";
  const astroLink = r.astrologer?.slug ? routes.astrologer(r.astrologer.slug) : null;

  return (
    <AccountShell
      back={back}
      title="Remedy request"
      subtitle={r.code ? `Request ${r.code}` : undefined}
      actions={
        delivered ? (
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden /> Print / Save PDF
          </Button>
        ) : null
      }
    >
      <style>{PRINT_CSS}</style>
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            {astroLink ? (
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
                <RemedyStatusBadge status={r.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted">{[categoryLabel(r.category), r.forName && `For ${r.forName}`].filter(Boolean).join(" · ")}</p>
              <p className="mt-0.5 text-xs text-muted">{`Asked ${formatDateTime(r.createdAt, locale)} · ${formatCurrency(r.price, locale)}`}</p>
            </div>
          </div>

          {pending && (
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <p className="flex items-center gap-2 font-semibold">
                <Clock className="size-4 shrink-0" aria-hidden />
                {left === null ? "Waiting for the astrologer's reply" : left > 0 ? `Reply due in ${timeLeftText(left)}` : "Reply time is over. Your refund is on its way."}
              </p>
              <p className="mt-1 text-xs">{`${astroName} will reply by ${formatDateTime(r.dueAt, locale)}. If not, the full amount comes back to your wallet automatically.`}</p>
            </div>
          )}
          {pending && r.canCancel && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">You can cancel until the astrologer opens your request.</p>
              <Button variant="outline" size="sm" onClick={() => setConfirmCancel(true)}>
                Cancel request
              </Button>
            </div>
          )}
          {pending && !r.canCancel && <p className="mt-3 text-xs text-muted">The astrologer has opened your request and is working on it.</p>}
        </Card>

        <Card className="p-5">
          <SectionTitle icon={MessageCircleQuestion}>Your question</SectionTitle>
          <p className="whitespace-pre-line break-words text-sm">{r.question}</p>
        </Card>

        {delivered && (
          <Card id="remedy-print" className="p-5">
            {/* Print header: only on paper */}
            <div className="mb-4 hidden border-b pb-3 print:block">
              <p className="text-lg font-bold">{`${siteConfig.name} · Remedy`}</p>
              <p className="text-sm">{[`From ${astroName}`, r.forName && `For ${r.forName}`, categoryLabel(r.category), r.code].filter(Boolean).join(" · ")}</p>
              <p className="mt-2 text-sm">
                <strong>Question: </strong>
                {r.question}
              </p>
            </div>
            <SectionTitle icon={HandHeart}>{`Your remedy from ${astroName}`}</SectionTitle>
            {r.deliveredAt && <p className="-mt-2 mb-3 text-xs text-muted">{`Sent ${formatDateTime(r.deliveredAt, locale)}`}</p>}
            {r.remedy.message && <p className="whitespace-pre-line break-words text-sm leading-relaxed">{r.remedy.message}</p>}
            {r.remedy.items?.length > 0 && (
              <ul className="mt-4 space-y-3">
                {r.remedy.items.map((item, i) => (
                  <RemedyItemCard key={i} item={item} />
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-muted">Remedies are guidance based on astrology. For health, legal or money matters, please also consult a qualified professional.</p>
          </Card>
        )}

        {REFUNDED_STATUSES.includes(r.status) && <RefundInfo remedy={r} />}

        {r.status === "delivered" && (
          <>
            <FollowUpCard key={`fu-${r.followUp ? 1 : 0}`} remedy={r} onSaved={onSaved} />
            <RatingCard key={`rt-${r.rating || 0}`} remedy={r} onSaved={onSaved} />
          </>
        )}
      </div>

      <AccountConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancel}
        loading={cancelling}
        title="Cancel this request?"
        description={`${formatCurrency(r.price, locale)} will go back to your wallet right away. ${astroName} won't see your question.`}
        confirmLabel="Yes, cancel"
      />
    </AccountShell>
  );
}
