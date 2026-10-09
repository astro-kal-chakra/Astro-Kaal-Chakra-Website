"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift, ListPlus, MessageCircle, Phone, ShieldCheck, Video, Wallet } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { StatusBadge } from "@/features/astrologers/components/StatusBadge";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { modesFor, priceFor, sessionService } from "@/lib/api/services/session.service";
import { isModeAvailable } from "@/features/astrologers/lib/modes";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { RatingStars } from "@/components/ui/RatingStars";
import { useSessionTransport, useTransportEvent } from "../../hooks/useSessionTransport";
import { FREE_CHAT_MINUTES, MIN_BALANCE_MINUTES, MIN_WALLET_BALANCE, REQUEST_TIMEOUT_SECONDS, SESSION_MODES, minBalanceFor } from "../../lib/sessionEvents";
import { SessionScreenState } from "../SessionParts";
import { SimilarAstrologers } from "./SimilarAstrologers";
import { RequestStatusPanel, WaitingPanel } from "./WaitingPanel";
import { QueuePanel, YourTurnModal } from "./QueuePanel";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const MODE_ICONS = { chat: MessageCircle, call: Phone, video: Video };

/** Path of the live screen for a session in a given mode (voice calls use ?mode=call). */
export const liveSessionPath = (sessionId, mode) =>
  mode === SESSION_MODES.CHAT
    ? routes.chat(sessionId)
    : `${routes.call(sessionId)}${mode === SESSION_MODES.CALL ? "?mode=call" : ""}`;

/**
 * Pre-session screen + request / waitlist state machine.
 * phase: select → waiting (30s) → (session:start → redirect) | rejected | timeout (session:missed)
 *        select → queue → queue:offer (60s, accept / decline) → (accepted → redirect) | queueExpired
 */
export function ConsultView({ slug, initialMode, waitlist, simulate }) {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const transport = useSessionTransport();

  const [astrologer, setAstrologer] = useState(undefined); // undefined = loading, null = not found
  const [pre, setPre] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [phase, setPhase] = useState("select");
  const [request, setRequest] = useState(null); // { sessionId, expiresAt }
  const [queue, setQueue] = useState(null); // { entryId, position, estimatedWaitSec, endReason? }
  const [turn, setTurn] = useState(null); // { expiresAt }
  const [busy, setBusy] = useState(null); // "start" | "cancel" | "queue" | "leave" | "accept" | "decline"

  // Pending server-side state to clean up if the user leaves this page.
  const pending = useRef({ sessionId: null, entryId: null });
  const inFlight = useRef(false);

  useEffect(() => {
    let alive = true;
    Promise.all([astrologerService.getBySlug(slug), sessionService.getPreSession()])
      .then(([a, p]) => {
        if (!alive) return;
        setAstrologer(a);
        setPre(p);
      })
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(
    () => () => {
      const { sessionId, entryId } = pending.current;
      if (sessionId) sessionService.cancelRequest(sessionId).catch(() => {});
      if (entryId) sessionService.leaveQueue(entryId).catch(() => {});
    },
    []
  );

  const goLive = (sessionId, liveMode, usedFreeChat) => {
    pending.current = { sessionId: null, entryId: null };
    if (usedFreeChat) setUser((u) => (u ? { ...u, freeChatAvailable: false } : u));
    router.replace(`${liveSessionPath(sessionId, liveMode)}`);
  };

  /* --------------------------- live server events --------------------------- */

  useTransportEvent(transport, SOCKET_EVENTS.SESSION_START, (p) => {
    if (p.sessionId === request?.sessionId) goLive(p.sessionId, request.mode, request.useFreeChat);
  });
  useTransportEvent(transport, SOCKET_EVENTS.SESSION_REJECTED, (p) => {
    if (p.sessionId !== request?.sessionId) return;
    pending.current.sessionId = null;
    setPhase("rejected");
  });
  useTransportEvent(transport, SOCKET_EVENTS.SESSION_MISSED, (p) => {
    if (p.sessionId !== request?.sessionId) return;
    pending.current.sessionId = null;
    setPhase("timeout");
  });
  useTransportEvent(transport, SOCKET_EVENTS.QUEUE_POSITION, (p) => {
    if (p.entryId === queue?.entryId) setQueue((q) => ({ ...q, position: p.position, estimatedWaitSec: p.estimatedWaitSec }));
  });
  useTransportEvent(transport, SOCKET_EVENTS.QUEUE_OFFER, (p) => {
    if (p.entryId !== queue?.entryId) return;
    setQueue((q) => ({ ...q, position: 0 }));
    setTurn({ expiresAt: new Date(p.expiresAt).getTime() || Date.now() + p.seconds * 1000, seconds: p.seconds });
  });
  // Offer expired / declined / not possible any more, or the astrologer cleared the list.
  const endQueue = (p) => {
    if (p.entryId !== queue?.entryId || p.reason === "declined") return;
    pending.current.entryId = null;
    setTurn(null);
    setQueue((q) => (q ? { ...q, endReason: p.reason } : q));
    setPhase("queueExpired");
  };
  useTransportEvent(transport, SOCKET_EVENTS.QUEUE_SKIPPED, endQueue);
  useTransportEvent(transport, SOCKET_EVENTS.QUEUE_CLEARED, (p) => endQueue({ ...p, reason: "cleared" }));

  /* ---------------------------------- render ---------------------------------- */

  if (loadError) return <SessionScreenState title="Something went wrong" text="Please try again. If the problem continues, contact support." />;
  if (astrologer === undefined || !pre) return <SessionScreenState loading />;
  if (!astrologer) return <SessionScreenState title="Astrologer not found" text="This astrologer is no longer available. Please choose another astrologer." />;

  const a = astrologer;
  const modes = modesFor(a);
  // Only modes the astrologer switched on for this online session can be requested (e.g. chat only)
  const openModes = modes.filter((m) => isModeAvailable(a, m));
  const activeMode = openModes.includes(mode) ? mode : openModes[0] || SESSION_MODES.CHAT;
  const price = priceFor(a, activeMode);
  const freeChatAvailable = user?.freeChatAvailable !== false && pre.freeChatAvailable;
  const astrologerAllowsFree = a.freeChatEligible !== false;
  // Free applies to the modes chosen in the dashboard (chat by default)
  const freeModes = pre.freeModes?.length ? pre.freeModes : [SESSION_MODES.CHAT];
  const useFreeChat = freeModes.includes(activeMode) && freeChatAvailable && astrologerAllowsFree;
  // Astrologer in "free chat" mode takes only new users' free chats
  const freeOnlyBlocked = Boolean(a.freeChatOnly) && !useFreeChat;
  const required = minBalanceFor(price);
  const hasEnough = !freeOnlyBlocked && (useFreeChat || pre.balance >= required);
  const isBusy = a.status === "busy";
  const isOffline = a.status === "offline";
  const wantsQueue = isBusy || (waitlist && a.status !== "online");

  const handleError = (err) => {
    if (err?.code === "ASTRO_FREE_ONLY" || err?.code === "FREE_CHAT_USED") {
      toast({ type: "error", title: "Free chat only", message: err.message });
      return;
    }
    const key = {
      INSUFFICIENT_BALANCE: "session.errors.insufficientBalance",
      ASTROLOGER_BUSY: "session.errors.astrologerBusy",
      ASTROLOGER_OFFLINE: "session.errors.astrologerOffline",
      ACTIVE_SESSION_EXISTS: "session.errors.activeSession",
    }[err?.code];
    toast({ type: "error", title: key ? t(key) : "Something went wrong", message: key ? undefined : "Please try again. If the problem continues, contact support." });
  };

  const run = async (name, fn) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(name);
    try {
      await fn();
    } catch (err) {
      handleError(err);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };

  const start = () =>
    run("start", async () => {
      const res = await sessionService.request({
        astrologer: a,
        mode: activeMode,
        useFreeChat,
        idempotencyKey: crypto.randomUUID(),
        simulate,
      });
      pending.current.sessionId = res.sessionId;
      setRequest({ sessionId: res.sessionId, mode: activeMode, useFreeChat, expiresAt: Date.now() + (res.expiresInSec || REQUEST_TIMEOUT_SECONDS) * 1000 });
      setPhase("waiting");
    });

  const cancel = () =>
    run("cancel", async () => {
      if (request) await sessionService.cancelRequest(request.sessionId);
      pending.current.sessionId = null;
      setRequest(null);
      setPhase("select");
    });

  const joinQueue = () =>
    run("queue", async () => {
      const res = await sessionService.joinQueue({ astrologer: a, mode: activeMode, useFreeChat });
      pending.current.entryId = res.entryId;
      setQueue(res);
      setTurn(null);
      setPhase("queue");
    });

  const leaveQueue = () =>
    run("leave", async () => {
      if (queue) await sessionService.leaveQueue(queue.entryId);
      pending.current.entryId = null;
      setQueue(null);
      setTurn(null);
      setPhase("select");
    });

  const acceptTurn = () =>
    run("accept", async () => {
      try {
        const res = await sessionService.acceptTurn(queue.entryId, { astrologer: a, mode: activeMode, useFreeChat });
        goLive(res.sessionId, res.mode || activeMode, useFreeChat);
      } catch (err) {
        if (err?.code !== "QUEUE_EXPIRED") throw err;
        pending.current.entryId = null;
        setTurn(null);
        setPhase("queueExpired");
      }
    });

  /** Decline the turn: the next person gets it and this user leaves the waitlist. */
  const declineTurn = () =>
    run("decline", async () => {
      if (queue) await sessionService.declineTurn(queue.entryId);
      pending.current.entryId = null;
      setQueue(null);
      setTurn(null);
      setPhase("select");
    });

  const pickSimilar = async (other) => {
    const { sessionId, entryId } = pending.current;
    pending.current = { sessionId: null, entryId: null };
    if (sessionId) sessionService.cancelRequest(sessionId).catch(() => {});
    if (entryId) sessionService.leaveQueue(entryId).catch(() => {});
    router.push(`${routes.consult}?astrologer=${other.slug}&mode=${activeMode}`);
  };

  const backToSelect = () => {
    setRequest(null);
    setPhase("select");
  };

  const similar = (
    <SimilarAstrologers
      astrologer={a}
      mode={activeMode}
      onPick={pickSimilar}
      title={phase === "queue" ? "Don't want to wait? Available now" : undefined}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-2">
        {phase === "select" ? (
          <LocaleLink
            href={routes.astrologer(a.slug)}
            className="flex size-10 items-center justify-center rounded-full hover:bg-surface-muted"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </LocaleLink>
        ) : (
          <span className="w-2" aria-hidden />
        )}
        <h1 className="font-display text-lg font-semibold">
          {(phase === "queue" || phase === "queueExpired" ? "Waitlist" : "Start consultation")}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-4 pb-32 pt-5">
          {phase === "select" && (
            <SelectStep
              a={a}
              modes={modes}
              activeMode={activeMode}
              onModeChange={setMode}
              price={price}
              pre={pre}
              required={required}
              hasEnough={hasEnough}
              useFreeChat={useFreeChat}
              freeBlockedByAstrologer={activeMode === SESSION_MODES.CHAT && freeChatAvailable && !astrologerAllowsFree}
              isOffline={isOffline}
            />
          )}

          {phase === "waiting" && (
            <WaitingPanel astrologer={a} expiresAt={request?.expiresAt} onCancel={cancel} cancelling={busy === "cancel"} />
          )}

          {(phase === "rejected" || phase === "timeout") && (
            <RequestStatusPanel
              kind={phase}
              astrologer={a}
              onRetry={start}
              retrying={busy === "start"}
              onBack={backToSelect}
            />
          )}

          {(phase === "queue" || phase === "queueExpired") && queue && (
            <QueuePanel
              astrologer={a}
              queue={queue}
              expired={phase === "queueExpired"}
              onLeave={leaveQueue}
              leaving={busy === "leave"}
              onRejoin={joinQueue}
              rejoining={busy === "queue"}
            />
          )}

          {(phase !== "select" || isOffline || isBusy || freeOnlyBlocked) && similar}
        </div>
      </div>

      {phase === "select" && !isOffline && (
        <div className="shrink-0 border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto max-w-lg">
            {freeOnlyBlocked && (
              <p role="status" className="mb-2 rounded-xl bg-surface-muted px-3 py-2 text-center text-sm text-muted">
                {a.name} is taking free chats for new users only right now. Please choose another astrologer below.
              </p>
            )}
            {wantsQueue ? (
              <Button size="lg" variant="gold" className="w-full" onClick={joinQueue} loading={busy === "queue"} disabled={!hasEnough}>
                <ListPlus className="size-5" aria-hidden />
                Join waitlist
              </Button>
            ) : (
              <Button size="lg" variant="success" className="w-full" onClick={start} loading={busy === "start"} disabled={!hasEnough}>
                {(() => {
                  const Icon = MODE_ICONS[activeMode];
                  return <Icon className="size-5" aria-hidden />;
                })()}
                {useFreeChat ? "Start free chat" : t(`session.consult.start.${activeMode}`)}
              </Button>
            )}
            <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-muted">
              <ShieldCheck className="size-3.5" aria-hidden />
              Private &amp; secure — contact details are never shared
            </p>
          </div>
        </div>
      )}

      {turn && phase === "queue" && (
        <YourTurnModal
          astrologer={a}
          expiresAt={turn.expiresAt}
          seconds={turn.seconds}
          onAccept={acceptTurn}
          accepting={busy === "accept"}
          onDecline={declineTurn}
          declining={busy === "decline"}
          onExpire={() => {
            pending.current.entryId = null;
            setTurn(null);
            setPhase("queueExpired");
          }}
        />
      )}
    </div>
  );
}

function SelectStep({ a, modes, activeMode, onModeChange, price, pre, required, hasEnough, useFreeChat, freeBlockedByAstrologer, isOffline }) {
  const locale = SITE_LOCALE;

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-4 p-4">
        <Avatar src={a.avatarUrl} name={a.name} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{a.name}</p>
          <p className="truncate text-sm text-muted">{a.specialties.join(" · ")}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <StatusBadge status={a.status} />
            <RatingStars value={a.rating} size={12} />
            <span>{`${a.experienceYears} yrs`}</span>
          </div>
        </div>
      </Card>

      {isOffline && (
        <p role="status" className="rounded-2xl border border-line bg-surface-muted p-4 text-sm">
          {`${a.name} is offline right now. Try one of these similar astrologers who are available.`}
        </p>
      )}
      {a.status === "busy" && (
        <p role="status" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          {`${a.name} is in another consultation (${a.queueCount || 0} waiting). Join the waitlist and we'll let you know when it's your turn.`}
        </p>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">How would you like to talk?</legend>
        <div className={cn("grid gap-2", modes.length === 3 ? "grid-cols-3" : modes.length === 2 ? "grid-cols-2" : "grid-cols-1")} role="radiogroup">
          {modes.map((m) => {
            const Icon = MODE_ICONS[m];
            const selected = m === activeMode;
            const off = !isModeAvailable(a, m);
            return (
              <label
                key={m}
                title={off ? "Not available right now" : undefined}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-colors",
                  off && "cursor-not-allowed opacity-50",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  selected
                    ? "border-brand-500 bg-brand-50 dark:border-gold-400 dark:bg-brand-800/40"
                    : "border-line bg-surface hover:bg-surface-muted"
                )}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={selected}
                  disabled={off}
                  onChange={() => onModeChange(m)}
                  className="sr-only"
                />
                <Icon className={cn("size-6", selected ? "text-brand-600 dark:text-gold-400" : "text-muted")} aria-hidden />
                <span className="text-sm font-semibold">{t(`session.modes.${m}`)}</span>
                <span className="text-xs text-muted">
                  {off ? "Not available now" : `${formatCurrency(priceFor(a, m), locale)}/min`}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {useFreeChat && (
        <div className="flex gap-3 rounded-2xl bg-cosmic p-4 text-white">
          <Gift className="size-6 shrink-0 text-gold-300" aria-hidden />
          <div>
            <p className="font-semibold text-gold-200">
              {`Your first ${pre.freeMinutes || FREE_CHAT_MINUTES}-minute chat is free`}
            </p>
            <p className="mt-0.5 text-sm text-white/80">
              {`Chat only, once per account and device. The chat ends when the free ${pre.freeMinutes || FREE_CHAT_MINUTES} minutes are over — nothing is taken from your wallet.`}
            </p>
          </div>
        </div>
      )}
      {freeBlockedByAstrologer && (
        <p className="rounded-2xl bg-surface-muted p-3 text-xs text-muted">{"Your free first chat can't be used with this astrologer. Choose an astrologer marked FREE to use it."}</p>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-300">
              <Wallet className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs text-muted">Wallet balance</p>
              <p className="text-lg font-bold">{formatCurrency(pre.balance, locale)}</p>
            </div>
          </div>
          <ButtonLink href={routes.wallet} variant="outline" size="sm">
            Recharge
          </ButtonLink>
        </div>
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Price</dt>
            <dd className="font-semibold">
              {formatCurrency(price, locale)}
              /min
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Minimum balance to start</dt>
            <dd className="font-semibold">{useFreeChat ? <Badge tone="gold">FREE</Badge> : formatCurrency(required, locale)}</dd>
          </div>
        </dl>
        {!hasEnough && (
          <div role="alert" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            <p className="font-semibold">Not enough balance</p>
            <p className="mt-0.5">
              {`To start you need ${formatCurrency(required, locale)} in your wallet (${MIN_BALANCE_MINUTES} minutes at this rate, or ${formatCurrency(MIN_WALLET_BALANCE, locale)} — whichever is more). Add ${formatCurrency(Math.max(0, required - pre.balance), locale)} or more to continue.`}
            </p>
            <ButtonLink href={routes.wallet} variant="gold" size="md" className="mt-3 w-full">
              Recharge now
            </ButtonLink>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          {`${formatCurrency(price, locale)}/min from your wallet. Any unused prepaid time is returned automatically when the session ends.`}
        </p>
      </Card>
    </div>
  );
}
