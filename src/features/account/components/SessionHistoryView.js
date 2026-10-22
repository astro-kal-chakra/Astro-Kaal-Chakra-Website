"use client";

import { useState } from "react";
import { FileText, History, LifeBuoy, MessageCircle, Phone, RotateCcw, Video } from "lucide-react";
import { routes } from "@/config/routes";
import { sessionHistoryService } from "@/lib/api/services/session-history.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDuration } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { formatDateTime } from "../lib/format";
import { AccountFilterChips } from "./AccountControls";
import { AccountShell } from "./AccountShell";
import { AccountEmptyCard, AccountErrorState, AccountListSkeleton, AccountLoadMore } from "./AccountStates";
import { usePagedResource } from "../hooks/usePagedResource";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const TABS = ["all", "chat", "call", "video"];
const STATUS_TONE = { completed: "success", missed: "warning", refunded: "brand" };

const TYPE_ICON = { chat: MessageCircle, call: Phone, video: Video };

function SessionRow({ session: s }) {
  const locale = SITE_LOCALE;
  const kind = TYPE_ICON[s.mode] ? s.mode : "chat";
  const Icon = TYPE_ICON[kind];

  return (
    <Card as="li" className="p-4">
      <div className="flex gap-3">
        <LocaleLink href={routes.astrologer(s.astrologer.slug)} className="shrink-0">
          <Avatar src={s.astrologer.avatarUrl} name={s.astrologer.name} size={48} />
        </LocaleLink>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <LocaleLink href={routes.astrologer(s.astrologer.slug)} className="min-w-0 truncate font-semibold hover:text-brand-600 dark:hover:text-gold-400">
              {s.astrologer.name}
            </LocaleLink>
            <Badge tone={STATUS_TONE[s.status]}>{t(`account.sessions.status.${s.status}`)}</Badge>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon className="size-3.5" aria-hidden /> {t(`account.sessions.type.${kind}`)}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={s.startedAt}>{formatDateTime(s.startedAt, locale)}</time>
          </p>
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted">Duration</dt>
              <dd className="font-medium tabular-nums">{formatDuration(s.durationSec)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Amount</dt>
              <dd className={cn("font-medium tabular-nums", s.status === "refunded" && "line-through opacity-70")}>
                {s.isFree ? "Free" : formatCurrency(s.totalCharged, locale)}
              </dd>
            </div>
            {!s.isFree && s.ratePerMin > 0 && (
              <div>
                <dt className="text-xs text-muted">Rate</dt>
                <dd className="font-medium tabular-nums">{`${formatCurrency(s.ratePerMin, locale)}/min`}</dd>
              </div>
            )}
          </dl>
          {s.unusedReturned > 0 && s.status !== "refunded" && (
            <p className="mt-1 text-xs text-muted">{`${formatCurrency(s.unusedReturned, locale)} unused time returned`}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
        <ButtonLink href={`${routes.consult}?astrologer=${s.astrologer.slug}&mode=${kind}`} size="sm" variant="primary">
          <RotateCcw className="size-3.5" aria-hidden /> Rebook
        </ButtonLink>
        {s.hasSummary && (
          <ButtonLink href={routes.sessionSummary(s.id)} size="sm" variant="ghost">
            <FileText className="size-3.5" aria-hidden /> Summary
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

export function SessionHistoryView() {
  const [tab, setTab] = useState("all");
  const list = usePagedResource((page) => sessionHistoryService.list({ type: tab, page }), tab);
  const { status, reload } = list;

  return (
    <AccountShell title="Session history" subtitle="All your consultations in one place.">
      <AccountFilterChips
        className="mb-4"
        label="Session history"
        value={tab}
        onChange={setTab}
        options={TABS.map((v) => ({ value: v, label: t(`account.sessions.tabs.${v}`) }))}
      />

      {status === "loading" && <AccountListSkeleton rows={4} />}
      {status === "error" && <AccountErrorState onRetry={reload} />}
      {status === "success" && list.items.length === 0 && (
        <AccountEmptyCard
          icon={History}
          title="No sessions yet"
          description="Your chats and calls with astrologers will appear here."
          action={<ButtonLink href={routes.astrologers}>Find an astrologer</ButtonLink>}
        />
      )}
      {status === "success" && list.items.length > 0 && (
        <>
          <p className="mb-2 text-sm text-muted" aria-live="polite">
            {`${list.total} sessions`}
          </p>
          <ul className="space-y-3">
            {list.items.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </ul>
          <AccountLoadMore list={list} label="Show older sessions" />
        </>
      )}

      <Card className="mt-6 flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center">
        <LifeBuoy className="size-5 text-brand-500" aria-hidden />
        <p className="flex-1 text-sm">Problem with a session?</p>
        <ButtonLink href={routes.support} size="sm" variant="outline">
          Get help
        </ButtonLink>
      </Card>
    </AccountShell>
  );
}
