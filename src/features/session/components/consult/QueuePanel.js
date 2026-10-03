"use client";

import { useEffect, useEffectEvent } from "react";
import { BellRing, Hourglass, Info, LogOut, RotateCcw, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useClockSeconds } from "../../hooks/useLiveSession";
import { QUEUE_ACCEPT_SECONDS } from "../../lib/sessionEvents";

/** Waitlist position, estimated wait and leave / rejoin actions. */
export function QueuePanel({ astrologer, queue, expired, onLeave, leaving, onRejoin, rejoining }) {

  if (expired) {
    return (
      <div className="flex flex-col items-center pt-6 text-center" role="alert">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <Hourglass className="size-8" aria-hidden />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold">You missed your turn</h2>
        <p className="mt-1 max-w-xs text-sm text-muted">{`Your place with ${astrologer.name} has expired because it wasn't accepted in time. You can join the waitlist again.`}</p>
        <Button size="lg" variant="gold" className="mt-6 min-w-48" onClick={onRejoin} loading={rejoining}>
          <RotateCcw className="size-4" aria-hidden />
          Rejoin waitlist
        </Button>
      </div>
    );
  }

  const minutes = Math.max(1, Math.ceil((queue.estimatedWaitSec || 0) / 60));

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="bg-cosmic px-5 py-6 text-center text-white">
          <Avatar src={astrologer.avatarUrl} name={astrologer.name} size={64} className="mx-auto" />
          <p className="mt-3 text-sm text-white/80">{`You're in the waitlist for ${astrologer.name}`}</p>
          <p className="mt-4 text-xs uppercase tracking-widest text-gold-200">Your position</p>
          <p translate="no" className="notranslate font-display text-6xl font-bold text-brand-600 dark:text-brand-400 tabular-nums" aria-live="polite" aria-atomic="true">
            #{queue.position}
          </p>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-line text-center">
          <div className="p-4">
            <dt className="flex items-center justify-center gap-1 text-xs text-muted">
              <Hourglass className="size-3.5" aria-hidden /> Estimated wait
            </dt>
            <dd className="mt-0.5 font-semibold">{`~${minutes} min`}</dd>
          </div>
          <div className="p-4">
            <dt className="flex items-center justify-center gap-1 text-xs text-muted">
              <Users className="size-3.5" aria-hidden /> People ahead
            </dt>
            <dd translate="no" className="notranslate mt-0.5 font-semibold tabular-nums">{Math.max(0, queue.position - 1)}</dd>
          </div>
        </dl>
      </Card>

      <p className="flex gap-2 rounded-2xl bg-surface-muted p-3 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {`Keep this page open. When it's your turn you'll have ${QUEUE_ACCEPT_SECONDS} seconds to accept.`}
      </p>

      <Button variant="outline" size="lg" className="w-full" onClick={onLeave} loading={leaving}>
        <LogOut className="size-4" aria-hidden />
        Leave waitlist
      </Button>
    </div>
  );
}

/** "It's your turn" — must be accepted inside the window or the place is lost. */
export function YourTurnModal({ astrologer, expiresAt, onAccept, accepting, onDecline, declining, onExpire }) {
  const nowSec = useClockSeconds();
  const remaining = nowSec ? Math.max(0, Math.ceil(expiresAt / 1000) - nowSec) : QUEUE_ACCEPT_SECONDS;
  const expire = useEffectEvent(onExpire);

  useEffect(() => {
    if (remaining === 0 && !accepting) expire();
  }, [remaining, accepting]);

  const pct = Math.min(100, (remaining / QUEUE_ACCEPT_SECONDS) * 100);

  return (
    <Modal open onClose={onDecline} dismissible={false} title="It's your turn!">
      <div className="text-center">
        <div className="relative mx-auto flex size-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-gold-400/30 motion-reduce:animate-none" aria-hidden />
          <Avatar src={astrologer.avatarUrl} name={astrologer.name} size={80} />
          <span className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-gold-500 text-brand-950">
            <BellRing className="size-4" aria-hidden />
          </span>
        </div>
        <p className="mt-4 text-sm text-muted">{`${astrologer.name} is ready for you. Accept now to start your session.`}</p>
        <p translate="no" className="notranslate mt-4 text-3xl font-bold tabular-nums" role="timer" aria-live="off">
          {remaining}s
        </p>
        <div
          className="mx-auto mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-label="Time left to accept"
          aria-valuemin={0}
          aria-valuemax={QUEUE_ACCEPT_SECONDS}
          aria-valuenow={remaining}
        >
          <div className="h-full rounded-full bg-gold-500 transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={onDecline} loading={declining} disabled={accepting}>
            Decline
          </Button>
          <Button variant="success" size="lg" onClick={onAccept} loading={accepting} disabled={declining}>
            Accept
          </Button>
        </div>
      </div>
    </Modal>
  );
}
