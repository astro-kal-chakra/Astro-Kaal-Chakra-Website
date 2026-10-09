"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, Gift, HelpCircle, MessageCircle, Send, UserCheck, UserPlus, Volume2, X } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { liveService } from "@/lib/api/services/live.service";
import { cn } from "@/lib/utils/cn";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { inputClasses } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Modal } from "@/components/ui/Modal";
import { newIdempotencyKey } from "../utils";
import { FloatingGift } from "./FloatingGift";
import { LiveBadge } from "./LiveBadge";
import { useLiveStream } from "../hooks/useLiveStream";
import { setFollowing, useIsFollowing } from "@/features/astrologers/hooks/useFollowing";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const MAX_MESSAGES = 120;
const MAX_FLOATING = 8;

/**
 * Live session room. The astrologer's broadcast plays on the stage (Agora, watch-only; useLiveStream).
 * Chat, viewers and gifts come from liveService.subscribe (socket, or a simulation in mock mode).
 */
export function LiveRoom({ session, gifts }) {
  const locale = SITE_LOCALE;
  const { requireAuth, user } = useAuth();
  const { toast } = useToast();
  const a = session.astrologer;

  const [messages, setMessages] = useState([]);
  const [viewers, setViewers] = useState(session.viewers || 0);
  const [ended, setEnded] = useState(false);
  const [text, setText] = useState("");
  const following = useIsFollowing(a ?? { id: "" });
  const [followBusy, setFollowBusy] = useState(false);
  const [floating, setFloating] = useState([]);
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [giftBusy, setGiftBusy] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  const { videoRef, state: streamState, soundBlocked, unmute } = useLiveStream(session.id, !ended);
  const playing = streamState === "playing";

  const listRef = useRef(null);
  const stickToBottom = useRef(true);
  const giftById = useMemo(() => Object.fromEntries(gifts.map((g) => [g.id, g])), [gifts]);
  const you = user?.name || "You";

  const giftLabel = useCallback((id) => t(`content.live.gifts.${id}`), []);

  const pushMessage = useCallback((m) => setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), m]), []);

  const spawnGift = useCallback(
    (giftId, from) => {
      const g = giftById[giftId];
      if (!g) return;
      const id = `${giftId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setFloating((prev) => [...prev.slice(-(MAX_FLOATING - 1)), { id, emoji: g.emoji, label: from, offset: 15 + Math.floor(Math.random() * 70) }]);
    },
    [giftById]
  );
  const removeFloating = useCallback((id) => setFloating((prev) => prev.filter((f) => f.id !== id)), []);

  // Room subscription: incoming chat, gifts and viewer count.
  useEffect(() => {
    const unsubscribe = liveService.subscribe(session.id, { locale, initialViewers: session.viewers }, (ev) => {
      if (ev.type === "message") {
        pushMessage(ev.message);
        if (ev.message.kind === "gift") spawnGift(ev.message.giftId, ev.message.user);
      } else if (ev.type === "viewers") {
        setViewers(ev.count);
      } else if (ev.type === "ended") {
        setEnded(true);
      }
    });
    return unsubscribe;
  }, [session.id, session.viewers, locale, pushMessage, spawnGift]);

  // Keep the chat pinned to the newest message unless the user scrolled up.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onChatScroll = (e) => {
    const el = e.currentTarget;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || ended) return;
    requireAuth(() => {
      stickToBottom.current = true;
      pushMessage({ id: `me_${Date.now()}`, user: you, text: body, kind: "chat", mine: true, at: new Date().toISOString() });
      setText("");
      liveService.sendMessage(session.id, body).catch(() => toast({ type: "error", message: "Something went wrong. Please try again." }));
    }, "live-chat");
  };

  const toggleFollow = () =>
    requireAuth(async () => {
      if (followBusy || !a) return;
      setFollowBusy(true);
      const nextState = !following;
      try {
        await astrologerService.follow(a.id, nextState);
        setFollowing(a.id, nextState);
        toast({ type: "success", message: (nextState ? `You're following ${a.name}` : `Unfollowed ${a.name}`) });
      } catch {
        toast({ type: "error", message: "Something went wrong. Please try again." });
      } finally {
        setFollowBusy(false);
      }
    }, "follow");

  const sendGift = (g) =>
    requireAuth(async () => {
      if (giftBusy) return;
      setGiftBusy(g.id);
      try {
        await liveService.sendGift(session.id, { giftId: g.id, price: g.price, idempotencyKey: newIdempotencyKey() });
        spawnGift(g.id, you);
        stickToBottom.current = true;
        pushMessage({ id: `gift_${Date.now()}`, user: you, kind: "gift", giftId: g.id, mine: true, at: new Date().toISOString() });
        toast({ type: "success", message: `You sent ${`${g.emoji} ${giftLabel(g.id)}`}!` });
      } catch (err) {
        if (err?.code === "INSUFFICIENT_BALANCE") {
          toast({ type: "warning", title: "Insufficient balance", message: "Recharge your wallet to continue." });
        } else {
          toast({ type: "error", message: "Something went wrong. Please try again." });
        }
      } finally {
        setGiftBusy(null);
      }
    }, "live-gift");

  const openAsk = () => requireAuth(() => setAskOpen(true), "live-question");

  return (
    <div className="container-page py-4 sm:py-6">
      <LocaleLink href={routes.live} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> All live sessions
      </LocaleLink>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Stage + actions */}
        <div className="min-w-0 space-y-4">
          <section
            aria-label="Live video stage"
            className={cn("relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br sm:aspect-video", session.gradient)}
          >
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden />
            {/* The astrologer's video (Agora renders a <video> in here) */}
            <div ref={videoRef} className={cn("absolute inset-0 bg-black", !(playing && !ended) && "invisible")} aria-label={a ? `${a.name}'s live video` : "Live video"} />
            {!playing && !ended && (
              <>
                <span className="absolute size-44 animate-ping rounded-full bg-gold-400/15 [animation-duration:3s]" aria-hidden />
                <span className="absolute size-60 rounded-full border border-gold-300/20" aria-hidden />
              </>
            )}
            {!(playing && !ended) && (
              <div className="relative flex flex-col items-center px-6 text-center text-white">
                <Avatar name={a?.name} src={a?.avatarUrl} size={128} />
                <p className="mt-3 text-sm text-white/70" role="status">
                  {ended
                    ? "This live session has ended."
                    : streamState === "unavailable"
                      ? "Live video isn't available right now."
                      : streamState === "error"
                        ? "Couldn't load the live video. Refresh the page to try again."
                        : streamState === "waiting"
                          ? `Waiting for ${a?.name || "the astrologer"}'s video…`
                          : "Connecting to the live video…"}
                </p>
              </div>
            )}
            {playing && !ended && soundBlocked && (
              <button
                type="button"
                onClick={unmute}
                className="absolute left-1/2 top-1/2 z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-black/70 px-5 py-3 font-semibold text-white backdrop-blur hover:bg-black/80"
              >
                <Volume2 className="size-5" aria-hidden /> Tap to unmute
              </button>
            )}

            <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 sm:inset-x-4 sm:top-4">
              {!ended && <LiveBadge label="LIVE" />}
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1 text-xs font-medium text-white" aria-live="off">
                <Eye className="size-3.5" aria-hidden /> {`${formatCompact(viewers, locale)} watching`}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-3 pt-12 sm:p-4 sm:pt-16">
              <div className="min-w-0 text-white">
                <h1 className="truncate font-display text-lg font-semibold sm:text-2xl">{session.title}</h1>
                {a && (
                  <LocaleLink href={routes.astrologer(a.slug)} className="text-sm text-white/80 hover:underline">
                    {a.name}
                  </LocaleLink>
                )}
              </div>
              <Button
                size="sm"
                variant={following ? "outline" : "gold"}
                onClick={toggleFollow}
                loading={followBusy}
                aria-pressed={following}
                className={following ? "border-white/40 bg-white/10 text-white hover:bg-white/20" : undefined}
              >
                {!followBusy && (following ? <UserCheck className="size-4" aria-hidden /> : <UserPlus className="size-4" aria-hidden />)}
                {following ? "Following" : "Follow"}
              </Button>
            </div>

            {floating.map((f) => (
              <FloatingGift key={f.id} id={f.id} emoji={f.emoji} label={f.label} offset={f.offset} onDone={removeFloating} />
            ))}
          </section>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={openAsk} disabled={ended}>
              <HelpCircle className="size-4" aria-hidden /> Ask a question · {formatCurrency(session.questionPrice, locale)}
            </Button>
            <Button variant="outline" onClick={() => setGiftsOpen((o) => !o)} aria-expanded={giftsOpen} aria-controls="gift-tray" disabled={ended}>
              <Gift className="size-4 text-gold-500" aria-hidden /> Send a gift
            </Button>
          </div>

          {giftsOpen && (
            <Card id="gift-tray" className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Gifts</h2>
                <button type="button" onClick={() => setGiftsOpen(false)} className="rounded-full p-1 text-muted hover:bg-surface-muted" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {gifts.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => sendGift(g)}
                      disabled={Boolean(giftBusy)}
                      aria-busy={giftBusy === g.id || undefined}
                      className={cn(
                        "flex w-full flex-col items-center gap-1 rounded-2xl border border-line bg-surface p-3 transition-transform hover:-translate-y-0.5 hover:border-gold-400 disabled:opacity-60",
                        giftBusy === g.id && "animate-pulse"
                      )}
                    >
                      <span className="text-3xl" aria-hidden>
                        {g.emoji}
                      </span>
                      <span className="text-xs font-medium">{giftLabel(g.id)}</span>
                      <span className="text-xs font-semibold text-gold-600 dark:text-gold-400">{formatCurrency(g.price, locale)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {a && (
            <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <Avatar name={a.name} src={a.avatarUrl} size={48} />
              <div className="flex-1">
                <h2 className="font-semibold">Want a private session?</h2>
                <p className="text-sm text-muted">{`Chat one-on-one with ${a.name} for a detailed reading.`}</p>
              </div>
              <div className="flex gap-2">
                <ButtonLink href={routes.astrologer(a.slug)} variant="outline" size="sm">
                  View profile
                </ButtonLink>
                <ButtonLink href={routes.astrologer(a.slug)} size="sm">
                  <MessageCircle className="size-4" aria-hidden /> Chat
                </ButtonLink>
              </div>
            </Card>
          )}
        </div>

        {/* Chat */}
        <Card as="section" aria-labelledby="live-chat-title" className="flex h-[480px] flex-col overflow-hidden lg:sticky lg:top-20 lg:h-[calc(100dvh-7rem)]">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 id="live-chat-title" className="font-semibold">
              Live chat
            </h2>
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Eye className="size-3.5" aria-hidden /> {formatCompact(viewers, locale)}
            </span>
          </header>

          <ol ref={listRef} onScroll={onChatScroll} className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm" aria-live="polite" aria-relevant="additions">
            {messages.length === 0 && <li className="py-8 text-center text-muted">Say hello to get the conversation started!</li>}
            {messages.map((m) => (
              <ChatLine key={m.id} m={m} t={t} gift={m.giftId ? giftById[m.giftId] : null} giftLabel={giftLabel} />
            ))}
          </ol>

          <p className="border-t border-line bg-surface-muted px-4 py-2 text-[11px] text-muted">Be respectful. Never share phone numbers or personal contact details.</p>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-line p-3">
            <label htmlFor="live-chat-input" className="sr-only">
              Say something…
            </label>
            <input
              id="live-chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Say something…"
              maxLength={200}
              autoComplete="off"
              disabled={ended}
              className={cn(inputClasses, "h-10 flex-1 rounded-full")}
            />
            <Button type="submit" size="icon" disabled={!text.trim() || ended} aria-label="Send">
              <Send className="size-4" aria-hidden />
            </Button>
          </form>
        </Card>
      </div>

      <AskQuestionModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        session={session}
        onAsked={(q) => {
          stickToBottom.current = true;
          pushMessage({ id: `q_${Date.now()}`, user: you, text: q, kind: "question", mine: true, at: new Date().toISOString() });
        }}
      />
    </div>
  );
}

function ChatLine({ m, t, gift, giftLabel }) {
  if (m.kind === "gift") {
    return (
      <li className="flex items-center gap-2 rounded-xl bg-gold-100/70 px-3 py-1.5 dark:bg-gold-700/20">
        <span className="text-lg" aria-hidden>
          {gift?.emoji}
        </span>
        <span>
          <strong className={m.mine ? "text-brand-600 dark:text-gold-300" : undefined}>{m.user}</strong>{" "}
          {`sent ${giftLabel(m.giftId)}`}
        </span>
      </li>
    );
  }
  if (m.kind === "question") {
    return (
      <li className="rounded-xl border border-brand-300 bg-brand-50 px-3 py-2 dark:border-brand-600 dark:bg-brand-800/50">
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600 dark:text-gold-300">
          Question · {m.user}
        </p>
        <p className="mt-0.5">{m.text}</p>
      </li>
    );
  }
  return (
    <li className="break-words">
      <strong className={m.mine ? "text-brand-600 dark:text-gold-300" : "text-muted"}>{m.user}</strong> <span>{m.text}</span>
    </li>
  );
}

function AskQuestionModal({ open, onClose, session, onAsked }) {
  const locale = SITE_LOCALE;
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [error, setError] = useState(null);
  const [lowBalance, setLowBalance] = useState(false);
  const [balance, setBalance] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const keyRef = useRef(null);
  const price = formatCurrency(session.questionPrice, locale);

  // Fetch the balance whenever the modal opens (setState happens in the async callback).
  useEffect(() => {
    if (!open) return;
    let active = true;
    liveService
      .getBalance()
      .then((r) => active && setBalance(r.balance))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [open]);

  const close = () => {
    if (submitting) return;
    setError(null);
    setLowBalance(false);
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const q = question.trim();
    if (q.length < 10) return setError("Please write at least 10 characters");
    setError(null);
    setLowBalance(false);
    setSubmitting(true);
    keyRef.current ??= newIdempotencyKey(); // reused on retry so the user is never charged twice
    try {
      const res = await liveService.askQuestion(session.id, { text: q, price: session.questionPrice, idempotencyKey: keyRef.current });
      keyRef.current = null;
      if (typeof res?.balance === "number") setBalance(res.balance);
      onAsked(q);
      setQuestion("");
      toast({ type: "success", message: "Question sent! It's in the queue." });
      onClose();
    } catch (err) {
      if (err?.code === "INSUFFICIENT_BALANCE") {
        keyRef.current = null;
        setLowBalance(true);
      } else {
        toast({ type: "error", message: "Something went wrong. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title={`Ask ${session.astrologer?.name} a question`} dismissible={!submitting}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-muted">{`Your question is highlighted on screen and answered live. ${price} will be debited from your wallet.`}</p>
        <div>
          <label htmlFor="live-question" className="sr-only">
            Ask a question
          </label>
          <textarea
            id="live-question"
            rows={4}
            maxLength={300}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Type your question (with birth details if needed)…"
            aria-invalid={Boolean(error)}
            className={cn(inputClasses, "h-auto resize-none py-2.5")}
          />
          <div className="mt-1 flex justify-between text-xs">
            {error ? (
              <span className="text-red-600" role="alert">
                {error}
              </span>
            ) : (
              <span />
            )}
            <span className="text-muted">{question.length}/300</span>
          </div>
        </div>

        {balance != null && <p className="text-sm text-muted">{`Wallet balance: ${formatCurrency(balance, locale)}`}</p>}

        {lowBalance && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300" role="alert">
            <div>
              <p className="font-semibold">Insufficient balance</p>
              <p>Recharge your wallet to continue.</p>
            </div>
            <ButtonLink href={routes.wallet} size="sm" variant="gold">
              Recharge
            </ButtonLink>
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" className="w-full" loading={submitting}>
          {`Pay ${price} & ask`}
        </Button>
      </form>
    </Modal>
  );
}
