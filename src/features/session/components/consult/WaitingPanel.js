"use client";

import { Clock3, PhoneOff, RotateCcw, UserX } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useClockSeconds } from "../../hooks/useLiveSession";
import { label as t } from "@/lib/labels";

/** Request sent — waiting for the astrologer to accept. */
export function WaitingPanel({ astrologer, expiresAt, onCancel, cancelling }) {
  const nowSec = useClockSeconds();
  const remaining = expiresAt && nowSec ? Math.max(0, Math.ceil(expiresAt / 1000) - nowSec) : null;

  return (
    <div className="flex flex-col items-center pt-6 text-center" role="status" aria-live="polite">
      <div className="relative flex size-36 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/25 motion-reduce:animate-none" aria-hidden />
        <span className="absolute inset-3 rounded-full bg-brand-400/20" aria-hidden />
        <Avatar src={astrologer.avatarUrl} name={astrologer.name} size={96} />
      </div>
      <h2 className="mt-6 font-display text-xl font-semibold">{`Waiting for ${astrologer.name} to accept`}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">The astrologer has 30 seconds to accept. Please stay on this screen.</p>
      {remaining != null && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold tabular-nums">
          <Clock3 className="size-4" aria-hidden />
          <span key={remaining}>{`${remaining}s left to respond`}</span>
        </p>
      )}
      <p className="mt-3 text-xs text-muted">{"You won't be charged until the session starts."}</p>
      <Button variant="outline" size="lg" className="mt-6 min-w-48" onClick={onCancel} loading={cancelling}>
        <PhoneOff className="size-4" aria-hidden />
        Cancel request
      </Button>
    </div>
  );
}

/** Rejected or no answer — offer retry and similar astrologers. */
export function RequestStatusPanel({ kind, astrologer, onRetry, retrying, onBack }) {
  const Icon = kind === "rejected" ? UserX : Clock3;
  return (
    <div className="flex flex-col items-center pt-6 text-center" role="alert">
      <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        <Icon className="size-8" aria-hidden />
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">{t(`session.waiting.${kind}Title`, { name: astrologer.name })}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">{t(`session.waiting.${kind}Text`)}</p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <Button size="lg" onClick={onRetry} loading={retrying}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
        <Button size="lg" variant="ghost" onClick={onBack} disabled={retrying}>
          Change chat / call type
        </Button>
      </div>
    </div>
  );
}
