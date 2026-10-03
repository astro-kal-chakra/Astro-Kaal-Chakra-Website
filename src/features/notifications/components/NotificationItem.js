"use client";

import { BellRing, CreditCard, ListOrdered, Sparkles, TicketPercent } from "lucide-react";
import { timeAgo } from "@/features/account/lib/format";
import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

export const NOTIFICATION_ICONS = {
  follow_online: { icon: BellRing, tone: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  queue_turn: { icon: ListOrdered, tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  payment_success: { icon: CreditCard, tone: "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200" },
  offer: { icon: TicketPercent, tone: "bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-300" },
  daily_horoscope: { icon: Sparkles, tone: "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-gold-300" },
};

/** One notification row; clicking marks it read and follows its link. */
export function NotificationItem({ notification: n, onOpen, compact = false }) {
  const locale = SITE_LOCALE;
  const { icon: Icon, tone } = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.daily_horoscope;

  const content = (
    <>
      <span className={cn("flex shrink-0 items-center justify-center rounded-full", tone, compact ? "size-9" : "size-10")}>
        <Icon className={compact ? "size-4" : "size-5"} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("text-sm", n.read ? "font-medium" : "font-semibold")}>{n.title}</span>
          <time dateTime={n.createdAt} className="shrink-0 text-xs text-muted">
            {timeAgo(n.createdAt, locale)}
          </time>
        </span>
        <span className={cn("mt-0.5 block text-sm text-muted", compact && "line-clamp-2")}>{n.body}</span>
        {!compact && <span className="mt-1 block text-xs text-muted">{t(`account.notifications.types.${n.type}`)}</span>}
      </span>
      {!n.read && (
        <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-brand-500 dark:bg-gold-400">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </>
  );

  const className = cn(
    "flex w-full items-start gap-3 text-left transition-colors hover:bg-surface-muted",
    compact ? "px-4 py-3" : "p-4",
    !n.read && "bg-brand-50/60 dark:bg-brand-800/30"
  );

  return n.href ? (
    <LocaleLink href={n.href} onClick={() => onOpen?.(n)} className={className}>
      {content}
    </LocaleLink>
  ) : (
    <button type="button" onClick={() => onOpen?.(n)} className={className}>
      {content}
    </button>
  );
}
