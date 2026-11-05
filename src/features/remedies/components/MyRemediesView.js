"use client";

import { useState } from "react";
import { ChevronRight, Clock, HandHeart } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { AccountFilterChips } from "@/features/account/components/AccountControls";
import { AccountShell } from "@/features/account/components/AccountShell";
import { AccountEmptyCard, AccountErrorState, AccountListSkeleton, AccountLoadMore } from "@/features/account/components/AccountStates";
import { usePagedResource } from "@/features/account/hooks/usePagedResource";
import { formatShortDate } from "@/features/account/lib/format";
import { REMEDY_TABS, remedyService } from "@/lib/api/services/remedy.service";
import { categoryLabel, label as t } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { useNow, useRemedyUpdates } from "../hooks/useRemedyLive";
import { timeLeftText } from "../lib/remedies";
import { RemedyStatusBadge } from "./RemedyStatusBadge";

const EMPTY = {
  all: { title: "No remedies yet", description: "Ask an astrologer about a problem and get written remedies: mantra, puja, gemstone and more." },
  open: { title: "Nothing waiting", description: "Requests waiting for the astrologer's reply show here." },
  done: { title: "Nothing here yet", description: "Answered, cancelled and refunded requests show here." },
};

function RemedyRow({ remedy: r, now }) {
  const locale = SITE_LOCALE;
  const left = r.status === "pending" && now ? new Date(r.dueAt).getTime() - now : null;
  const followUpWaiting = r.followUp && !r.followUp.answer;

  return (
    <li>
      <LocaleLink
        href={routes.remedy(r.id)}
        className={cn(
          "flex gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgb(120_53_15/0.04)] transition-colors hover:border-brand-200 dark:hover:border-brand-700",
          r.unread && "bg-brand-50/60 dark:bg-brand-800/30"
        )}
      >
        <Avatar src={r.astrologer?.avatar} name={r.astrologer?.name || "Astrologer"} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <p className={cn("flex min-w-0 items-center gap-2 truncate", r.unread ? "font-bold" : "font-semibold")}>
              {r.unread && (
                <span className="size-2.5 shrink-0 rounded-full bg-brand-500 dark:bg-gold-400">
                  <span className="sr-only">New</span>
                </span>
              )}
              <span className="truncate">{r.astrologer?.name}</span>
            </p>
            <RemedyStatusBadge status={r.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {[categoryLabel(r.category), r.forName && `For ${r.forName}`, formatShortDate(r.createdAt, locale)].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1.5 line-clamp-2 break-words text-sm">{r.question}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span className="tabular-nums">{formatCurrency(r.price, locale)}</span>
            {left !== null && left > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Clock className="size-3.5" aria-hidden /> {`Reply due in ${timeLeftText(left)}`}
              </span>
            )}
            {followUpWaiting && <span className="text-amber-700 dark:text-amber-400">Follow-up waiting for answer</span>}
          </div>
        </div>
        <ChevronRight className="mt-3 size-4 shrink-0 text-muted" aria-hidden />
      </LocaleLink>
    </li>
  );
}

/** /account/remedies: the user's remedy requests (All / Open / Done). */
export function MyRemediesView() {
  const [tab, setTab] = useState("all");
  const list = usePagedResource((page) => remedyService.list({ status: tab, page }), tab);
  const { status, reload, refresh } = list;
  const now = useNow();
  const unread = list.meta?.unread || 0;

  // A remedy was answered / refunded while this page is open
  useRemedyUpdates(() => refresh());

  return (
    <AccountShell
      title="My remedies"
      subtitle="Remedies you asked astrologers for."
      actions={
        <ButtonLink href={routes.astrologers} variant="outline" size="sm">
          Find an astrologer
        </ButtonLink>
      }
    >
      <AccountFilterChips
        className="mb-4"
        label="My remedies"
        value={tab}
        onChange={setTab}
        options={REMEDY_TABS.map((v) => ({ value: v, label: t(`remedies.tabs.${v}`) }))}
      />

      {status === "loading" && <AccountListSkeleton rows={3} />}
      {status === "error" && <AccountErrorState onRetry={reload} />}
      {status === "success" && list.items.length === 0 && (
        <AccountEmptyCard
          icon={HandHeart}
          title={EMPTY[tab].title}
          description={EMPTY[tab].description}
          action={tab === "all" ? <ButtonLink href={routes.astrologers}>Find an astrologer</ButtonLink> : null}
        />
      )}
      {status === "success" && list.items.length > 0 && (
        <>
          <p className="mb-2 text-sm text-muted" aria-live="polite">
            {`${list.total} ${list.total === 1 ? "request" : "requests"}${unread > 0 ? ` · ${unread} new` : ""}`}
          </p>
          <ul className="space-y-3">
            {list.items.map((r) => (
              <RemedyRow key={r.id} remedy={r} now={now} />
            ))}
          </ul>
          <AccountLoadMore list={list} label="Show older requests" />
        </>
      )}

      <Card className="mt-6 flex flex-col items-start gap-2 p-4 text-sm sm:flex-row sm:items-center">
        <p className="flex-1 text-muted">If an astrologer doesn&apos;t reply in time or declines, the full amount goes back to your wallet automatically.</p>
        <ButtonLink href={routes.support} size="sm" variant="ghost">
          Get help
        </ButtonLink>
      </Card>
    </AccountShell>
  );
}
