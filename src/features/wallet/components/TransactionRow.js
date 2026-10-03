"use client";

import { ArrowDownLeft, FileText, Gift, MessageCircle, RotateCcw, Video } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const ICONS = {
  recharge: { icon: ArrowDownLeft, tone: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  consultation: { icon: MessageCircle, tone: "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200" },
  video: { icon: Video, tone: "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200" },
  refund: { icon: RotateCcw, tone: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
  bonus: { icon: Gift, tone: "bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-300" },
  report: { icon: FileText, tone: "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200" },
};

export function TxnStatusBadge({ status }) {
  if (status === "failed")
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">Failed</Badge>;
  return <Badge tone={status === "pending" ? "warning" : "success"}>{t(`wallet.txnStatus.${status}`)}</Badge>;
}

/** Human title + subtitle for a transaction, fully localised. */
export function useTxnText() {
  return (txn) => {
    const m = txn.meta || {};
    switch (txn.type) {
      case "recharge":
        return { title: "Wallet recharge", subtitle: m.method ? `via ${m.method}` : "" };
      case "consultation":
        return {
          title: (m.mode === "video" ? `Video call with ${m.astrologer}` : `Chat with ${m.astrologer}`),
          subtitle: m.minutes ? `${m.minutes} min` : "",
        };
      case "refund":
        return { title: "Refund", subtitle: m.astrologer ? `Session with ${m.astrologer}` : "" };
      case "bonus":
        return {
          title: t(`wallet.txn.bonus_${m.reason || "pack"}`),
          subtitle: m.coupon ? `Code ${m.coupon}` : "",
        };
      case "report":
        return { title: "Report purchase", subtitle: m.slug ? t(`wallet.reports.catalog.${m.slug}.title`) : "" };
      default:
        return { title: txn.type, subtitle: "" };
    }
  };
}

export function TransactionRow({ txn, action, compact = false }) {
  const locale = SITE_LOCALE;
  const text = useTxnText()(txn);
  const kind = txn.type === "consultation" && txn.meta?.mode === "video" ? "video" : txn.type;
  const { icon: Icon, tone } = ICONS[kind] || ICONS.report;
  const credit = txn.amount > 0;
  const failed = txn.status === "failed";

  return (
    <li className={cn("flex items-center gap-3", compact ? "py-3" : "px-4 py-4 sm:px-5")}>
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{text.title}</p>
        <p className="truncate text-xs text-muted">
          {formatDate(txn.createdAt, locale, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
          {text.subtitle && ` · ${text.subtitle}`}
        </p>
        {action && <div className="mt-1.5">{action}</div>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "font-semibold tabular-nums",
            failed ? "text-muted line-through" : credit ? "text-green-700 dark:text-green-400" : "text-fg",
          )}
        >
          {credit ? "+" : "−"}
          {formatCurrency(Math.abs(txn.amount), locale)}
        </span>
        {(!compact || txn.status !== "success") && <TxnStatusBadge status={txn.status} />}
      </div>
    </li>
  );
}
