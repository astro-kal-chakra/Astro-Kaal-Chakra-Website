"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, BadgeCheck, Clock, Gift, LogOut, ShieldAlert, Wallet, WalletCards, WifiOff, UserX } from "lucide-react";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDuration } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Skeleton";
import { END_REASONS } from "../lib/sessionEvents";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

/** Avatar + name + specialties. Never shows contact details. */
export function AstrologerIdentity({ astrologer, size = 40, subtitle, className, tone = "default" }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <Avatar src={astrologer.avatarUrl} name={astrologer.name} size={size} />
      <div className="min-w-0">
        <p className={cn("flex items-center gap-1 truncate font-semibold", tone === "dark" && "text-white")}>
          <span className="truncate">{astrologer.name}</span>
          <BadgeCheck className="size-4 shrink-0 text-brand-500 dark:text-gold-400" aria-label="Verified" />
        </p>
        <p className={cn("truncate text-xs", tone === "dark" ? "text-white/70" : "text-muted")}>
          {subtitle ?? astrologer.specialties?.join(" · ")}
        </p>
      </div>
    </div>
  );
}

/** Live timer + running balance (or free-time countdown). Display only. */
export function SessionMeter({ elapsed, balance, freeRemaining, tone = "default", className }) {
  const locale = SITE_LOCALE;
  const chip =
    tone === "dark"
      ? "bg-black/40 text-white backdrop-blur"
      : "bg-surface-muted text-fg";
  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-semibold", className)}>
      <span
        className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 tabular-nums", chip)}
        role="timer"
        aria-label={`Session time ${formatDuration(elapsed)}`}
      >
        <Clock className="size-3.5" aria-hidden />
        {/* Live numbers are excluded from Google Translate so they keep updating */}
        <span translate="no" className="notranslate">{formatDuration(elapsed)}</span>
      </span>
      {freeRemaining > 0 ? (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-1 tabular-nums text-gold-700 dark:bg-gold-700/30 dark:text-gold-300"
          aria-label={`Free time left ${formatDuration(freeRemaining)}`}
        >
          <Gift className="size-3.5" aria-hidden />
          FREE <span translate="no" className="notranslate">{formatDuration(freeRemaining)}</span>
        </span>
      ) : (
        <span
          className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 tabular-nums", chip)}
          aria-label="Wallet balance"
        >
          <Wallet className="size-3.5" aria-hidden />
          <span translate="no" className="notranslate">{balance == null ? "—" : formatCurrency(balance, locale)}</span>
        </span>
      )}
    </div>
  );
}

/** Opens the wallet in a new tab so the running session is not interrupted. */
function RechargeLink({ className }) {
  return (
    <LocaleLink
      href={routes.wallet}
      target="_blank"
      rel="noopener"
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700",
        className
      )}
    >
      <WalletCards className="size-3.5" aria-hidden />
      Recharge
    </LocaleLink>
  );
}

export function LowBalanceBanner({ secondsLeft, className }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
        className
      )}
    >
      <AlertTriangle className="size-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1">
        <span className="font-semibold">Low balance.</span>{" "}
        {/* key remounts the text each tick so Google Translate re-translates it */}
        {secondsLeft != null && <span key={secondsLeft}>{`About ${formatDuration(secondsLeft)} left.`}</span>}
      </p>
      <RechargeLink />
    </div>
  );
}

export function ReconnectingBanner({ offline, className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 bg-brand-700 px-4 py-2 text-sm font-medium text-white dark:bg-brand-800",
        className
      )}
    >
      {offline ? <WifiOff className="size-4" aria-hidden /> : <Spinner className="size-4 border-white/40 border-t-white" />}
      {offline ? "You're offline. We'll reconnect when your internet is back." : "Reconnecting… messages will sync automatically"}
    </div>
  );
}

export function EndSessionModal({ open, onClose, onConfirm, loading, mode }) {
  const isChat = mode === "chat";
  return (
    <Modal open={open} onClose={onClose} title={(isChat ? "End this chat?" : "End this call?")}>
      <p className="text-sm text-muted">{"You'll only be charged for the time used so far. You can rebook this astrologer any time."}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" onClick={onClose} disabled={loading}>
          Keep talking
        </Button>
        <Button variant="danger" size="lg" onClick={onConfirm} loading={loading}>
          End now
        </Button>
      </div>
    </Modal>
  );
}

const REASON_ICON = {
  [END_REASONS.USER]: LogOut,
  [END_REASONS.ASTROLOGER]: UserX,
  [END_REASONS.ADMIN]: ShieldAlert,
  [END_REASONS.BALANCE]: Wallet,
};

/** Shown when the session finishes for any reason other than the user ending it here. */
export function SessionEndedPanel({ sessionId, ended, astrologer, isFree, tone = "default" }) {
  const locale = SITE_LOCALE;
  const router = useRouter();
  const reason = REASON_ICON[ended.reason] ? ended.reason : "other";
  const Icon = REASON_ICON[reason] || LogOut;
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-ended-title"
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
    >
      <div
        className={cn(
          "w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center shadow-2xl",
          tone === "dark" && "dark:bg-brand-950"
        )}
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-200">
          <Icon className="size-7" aria-hidden />
        </div>
        <h2 id="session-ended-title" className="text-lg font-semibold">
          {t(`session.ended.${reason}Title`, { name: astrologer.name })}
        </h2>
        <p className="mt-1 text-sm text-muted">{t(`session.ended.${reason}Text`)}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-surface-muted p-3">
            <dt className="text-xs text-muted">Duration</dt>
            <dd className="font-semibold tabular-nums">{formatDuration(ended.duration || 0)}</dd>
          </div>
          <div className="rounded-xl bg-surface-muted p-3">
            <dt className="text-xs text-muted">Charged</dt>
            <dd className="font-semibold">{isFree && !ended.charged ? "FREE" : formatCurrency(ended.charged || 0, locale)}</dd>
          </div>
        </dl>
        <div className="mt-5 grid gap-2">
          <Button size="lg" onClick={() => router.push(`${routes.sessionSummary(sessionId)}`)}>
            View summary
          </Button>
          {ended.reason === END_REASONS.BALANCE && (
            <ButtonLink href={routes.wallet} variant="gold" size="lg">
              Recharge wallet
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}

/** Full-screen loading / error placeholder used by every session screen. */
export function SessionScreenState({ loading, title, text, action }) {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center" aria-busy="true">
        <Spinner />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-200">
        <AlertTriangle className="size-7" aria-hidden />
      </div>
      <h1 className="text-lg font-semibold">{title}</h1>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      <div className="mt-5">{action ?? <ButtonLink href={routes.astrologers}>Browse astrologers</ButtonLink>}</div>
    </div>
  );
}
