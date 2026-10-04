"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, ShieldCheck } from "lucide-react";
import { routes } from "@/config/routes";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { CLIENT_EVENTS, SOCKET_EVENTS } from "@/lib/socket/events";
import { sessionService } from "@/lib/api/services/session.service";
import { formatCurrency, formatDuration } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useLeaveWarning } from "../../hooks/useLeaveWarning";
import { useLiveSession } from "../../hooks/useLiveSession";
import { useTransportEvent } from "../../hooks/useSessionTransport";
import { useVisualViewportStyle } from "../../hooks/useVisualViewportStyle";
import { END_REASONS } from "../../lib/sessionEvents";
import { MockSimulatorPanel } from "../MockSimulatorPanel";
import {
  AstrologerIdentity,
  EndSessionModal,
  LowBalanceBanner,
  ReconnectingBanner,
  SessionEndedPanel,
  SessionMeter,
  SessionScreenState,
} from "../SessionParts";
import { Composer } from "./Composer";
import { MessageList } from "./ChatMessages";
import { SITE_LOCALE } from "@/config/locale";

const SEND_TIMEOUT_MS = 10000;
const STATUS_RANK = { failed: -1, sending: 0, sent: 1, delivered: 2, read: 3 };

/** Merge server messages into local state without duplicates (by id or clientId). */
function mergeMessages(current, incoming) {
  const next = [...current];
  for (const msg of incoming) {
    const i = next.findIndex((m) => m.id === msg.id || (msg.clientId && m.clientId === msg.clientId));
    if (i === -1) next.push(msg);
    else {
      const keepStatus = (STATUS_RANK[next[i].status] ?? 0) > (STATUS_RANK[msg.status] ?? 0) ? next[i].status : msg.status;
      next[i] = { ...next[i], ...msg, status: keepStatus };
    }
  }
  return next.sort((a, b) => a.createdAt - b.createdAt);
}

export function ChatScreen({ sessionId }) {
  const locale = SITE_LOCALE;
  const router = useRouter();
  const { toast } = useToast();
  const online = useNetworkStatus();
  const vvStyle = useVisualViewportStyle();

  const [session, setSession] = useState(undefined); // undefined loading, null not found
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endedByMe, setEndedByMe] = useState(false);

  const live = useLiveSession(session);
  const { transport, connected, ended } = live;
  const isLive = !ended && session?.status === "active";
  const sendTimers = useRef(new Map());
  useLeaveWarning(isLive);

  useEffect(() => {
    let alive = true;
    Promise.all([sessionService.get(sessionId), sessionService.getMessages(sessionId)])
      .then(([s, msgs]) => {
        if (!alive) return;
        setSession(s);
        setMessages(mergeMessages([], msgs));
      })
      .catch(() => alive && setSession(null));
    return () => {
      alive = false;
    };
  }, [sessionId]);

  useEffect(() => {
    const timers = sendTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ------------------------------ read receipts ------------------------------ */

  const markRead = useCallback(
    (ids) => {
      if (ids.length && document.visibilityState === "visible") {
        transport.emit(CLIENT_EVENTS.CHAT_READ, { sessionId, messageIds: ids });
      }
    },
    [transport, sessionId]
  );

  /* ------------------------- reconnect → resync history ------------------------ */

  const [wasDisconnected, setWasDisconnected] = useState(false);
  if (!connected && !wasDisconnected) setWasDisconnected(true);
  useEffect(() => {
    if (!connected || !wasDisconnected || !session) return;
    let alive = true;
    sessionService
      .getMessages(sessionId)
      .then((msgs) => {
        if (!alive) return;
        setMessages((cur) => mergeMessages(cur, msgs));
        setWasDisconnected(false);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [connected, wasDisconnected, session, sessionId]);

  /* -------------------------------- live events -------------------------------- */

  useTransportEvent(transport, SOCKET_EVENTS.CHAT_MESSAGE, ({ sessionId: sid, message }) => {
    if (sid !== sessionId) return;
    setMessages((cur) => mergeMessages(cur, [message]));
    if (message.from === "astrologer") {
      setTyping(false);
      markRead([message.id]);
    }
  });
  useTransportEvent(transport, SOCKET_EVENTS.CHAT_TYPING, (p) => {
    if (p.sessionId === sessionId && p.role === "astrologer") setTyping(Boolean(p.isTyping));
  });
  const applyStatus = (ids, status) =>
    setMessages((cur) =>
      cur.map((m) => (ids.includes(m.id) && (STATUS_RANK[m.status] ?? 0) < STATUS_RANK[status] ? { ...m, status } : m))
    );
  useTransportEvent(transport, SOCKET_EVENTS.CHAT_DELIVERED, (p) => {
    if (p.sessionId === sessionId) applyStatus(p.messageIds, "delivered");
  });
  useTransportEvent(transport, SOCKET_EVENTS.CHAT_READ, (p) => {
    if (p.sessionId === sessionId) applyStatus(p.messageIds, "read");
  });

  /* --------------------------------- actions --------------------------------- */

  const deliver = (clientId, text) => {
    const timers = sendTimers.current;
    clearTimeout(timers.get(clientId));
    timers.set(
      clientId,
      setTimeout(() => {
        timers.delete(clientId);
        setMessages((cur) => cur.map((m) => (m.clientId === clientId && m.status === "sending" ? { ...m, status: "failed" } : m)));
      }, SEND_TIMEOUT_MS)
    );
    transport.emit(CLIENT_EVENTS.CHAT_SEND, { sessionId, clientMsgId: clientId, text }, (ack) => {
      clearTimeout(timers.get(clientId));
      timers.delete(clientId);
      setMessages((cur) =>
        ack?.ok
          ? mergeMessages(cur, [{ ...(ack.message ?? ack.data), clientId }])
          : cur.map((m) => (m.clientId === clientId ? { ...m, status: "failed" } : m))
      );
    });
  };

  const send = (text) => {
    const clientId = crypto.randomUUID();
    setMessages((cur) => [...cur, { id: clientId, clientId, from: "user", text, status: "sending", createdAt: Date.now() }]);
    deliver(clientId, text);
  };

  const retry = (message) => {
    setMessages((cur) => cur.map((m) => (m.clientId === message.clientId ? { ...m, status: "sending" } : m)));
    deliver(message.clientId, message.text);
  };

  const onTyping = (isTyping) => transport.emit(CLIENT_EVENTS.CHAT_TYPING, { sessionId, isTyping });

  const endChat = async () => {
    setEnding(true);
    setEndedByMe(true);
    try {
      await sessionService.end(sessionId);
      router.replace(`${routes.sessionSummary(sessionId)}`);
    } catch {
      setEnding(false);
      setEndedByMe(false);
      toast({ type: "error", title: "Something went wrong", message: "We couldn't end the session. Please try again." });
    }
  };

  /* --------------------------------- render ---------------------------------- */

  if (session === undefined) return <SessionScreenState loading />;
  if (session === null) {
    return <SessionScreenState title="Session not found" text="This session doesn't exist or has expired. You can start a new consultation any time." />;
  }

  const a = session.astrologer;
  const reconnecting = isLive && (!online || !connected);
  const showEndedPanel = ended && !(endedByMe && ended.reason === END_REASONS.USER);

  return (
    <div className="fixed inset-x-0 top-0 z-10 flex h-dvh flex-col bg-bg" style={vvStyle}>
      <header className="shrink-0 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-3">
          <AstrologerIdentity
            astrologer={a}
            className="flex-1"
            subtitle={
              typing ? (
                <span className="font-medium text-online">typing…</span>
              ) : isLive ? (
                session.isFree ? "Free chat" : `${formatCurrency(session.ratePerMin, locale)}/min`
              ) : (
                "Session ended"
              )
            }
          />
          <SessionMeter
            elapsed={live.elapsed}
            balance={live.balance}
            freeRemaining={live.freeRemaining}
            className="hidden sm:flex"
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmEnd(true)}
            disabled={!isLive}
            aria-label="End chat"
          >
            End
          </Button>
        </div>
        {/* On phones the meter sits on its own row so the name is not truncated. */}
        <div className="flex justify-center pb-2 sm:hidden">
          <SessionMeter elapsed={live.elapsed} balance={live.balance} freeRemaining={live.freeRemaining} />
        </div>
      </header>

      {reconnecting && <ReconnectingBanner offline={!online} />}
      {isLive && live.lowBalance && <LowBalanceBanner secondsLeft={live.secondsLeft} />}
      {isLive && live.freeRemaining > 0 && (
        <p className="flex shrink-0 items-center justify-center gap-1.5 bg-gold-100 px-4 py-1.5 text-center text-xs font-medium text-gold-700 dark:bg-gold-700/25 dark:text-gold-300">
          <Gift className="size-3.5" aria-hidden />
          <span key={live.freeRemaining}>
            {`Free chat: ${formatDuration(live.freeRemaining)} left · the chat ends when free time is over`}
          </span>
        </p>
      )}

      <MessageList
        messages={messages}
        astrologer={a}
        typing={typing && isLive}
        onRetry={retry}
        header={
          <p className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-1.5 px-4 text-center text-xs text-muted">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
            Messages are private. Never share phone numbers, payment or personal contact details.
          </p>
        }
      />

      <Composer onSend={send} onTyping={onTyping} disabled={!isLive} />

      {isLive && <MockSimulatorPanel sessionId={sessionId} isFree={session.isFree} className="bottom-24" />}

      <EndSessionModal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        onConfirm={endChat}
        loading={ending}
        mode="chat"
      />
      {showEndedPanel && <SessionEndedPanel sessionId={sessionId} ended={ended} astrologer={a} isFree={session.isFree} />}
    </div>
  );
}
