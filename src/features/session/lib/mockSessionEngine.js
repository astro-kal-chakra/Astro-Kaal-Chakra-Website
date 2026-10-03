/**
 * MOCK SESSION ENGINE — stands in for the backend + Socket.io while
 * NEXT_PUBLIC_API_URL is not configured. Everything "server-side" about a live
 * consultation is simulated here, in one place:
 *
 *   - request → accept / reject / timeout
 *   - waitlist position updates, "your turn", expiry
 *   - server-authoritative billing ticks (SESSION_BILLING) and SESSION_ENDED
 *   - chat delivery / read receipts, astrologer typing + replies
 *   - connection drops (also follows the browser's online/offline events)
 *
 * It exposes the same surface the UI uses on a socket.io client
 * (`on`, `off`, `emit(event, payload, ack)`, `connected`) and pushes events with
 * the same names/payloads as SOCKET_EVENTS, so swapping in the real socket is a
 * one-line change in useSessionTransport().
 */

import { SOCKET_EVENTS as E } from "@/lib/socket/events";
import {
  consumeMockFreeChat,
  getMockBalance,
  getMockMessages,
  getMockSession,
  markMockMessages,
  mockId,
  saveMockSession,
  setMockBalance,
  updateMockSession,
  upsertMockMessage,
} from "@/lib/api/mock/session";
import { END_REASONS, LOW_BALANCE_SECONDS, QUEUE_ACCEPT_SECONDS, SESSION_CLIENT_EVENTS, SYSTEM_MESSAGES } from "./sessionEvents";

const BILLING_TICK_MS = 2000;
const ACCEPT_DELAY_MS = 4000;
const QUEUE_STEP_MS = 5000;

const REPLIES = [
  "Thank you for sharing. May I have your date, time and place of birth to look at your chart?",
  "I can see Jupiter is moving into a favourable position for you in the coming months.",
  "Your Saturn period is asking for patience right now — avoid hasty decisions until the next full moon.",
  "Career-wise, the period after your birthday looks promising. Keep preparing.",
  "For relationships, open and calm communication will help a lot this month.",
  "A simple remedy: offer water to the Sun every morning and chant the Gayatri mantra 11 times.",
  "Is there anything specific you would like me to look at more closely?",
];

const now = () => Date.now();

class MockSessionEngine {
  connected = true;
  #listeners = new Map();
  #buffer = [];
  #live = new Map(); // sessionId -> { timer, replyIndex, timeouts:Set }
  #requests = new Map(); // sessionId -> timeout id
  #queues = new Map(); // queueId -> { timer, position, astrologer, mode, expiry }
  #windowBound = false;

  /* ------------------------------ socket.io surface ----------------------------- */

  on(event, cb) {
    this.#bindWindow();
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(cb);
    return this;
  }

  off(event, cb) {
    this.#listeners.get(event)?.delete(cb);
    return this;
  }

  /** Client → "server". `ack` mimics socket.io acknowledgements. */
  emit(event, payload = {}, ack) {
    if (!this.connected) {
      ack?.({ ok: false, error: "disconnected" });
      return this;
    }
    switch (event) {
      case SESSION_CLIENT_EVENTS.JOIN:
        this.#join(payload.sessionId);
        ack?.({ ok: true });
        break;
      case SESSION_CLIENT_EVENTS.LEAVE:
        this.#stopLive(payload.sessionId);
        break;
      case E.CHAT_MESSAGE:
        ack?.(this.#receiveUserMessage(payload));
        break;
      case E.CHAT_READ:
        markMockMessages(payload.sessionId, payload.messageIds || [], "read");
        break;
      default:
        break;
    }
    return this;
  }

  /** Server → client. Buffered while "disconnected", flushed on reconnect. */
  #push(event, payload) {
    if (!this.connected) {
      this.#buffer.push([event, payload]);
      return;
    }
    this.#listeners.get(event)?.forEach((cb) => cb(payload));
  }

  #fireConnection(event) {
    this.#listeners.get(event)?.forEach((cb) => cb());
  }

  #bindWindow() {
    if (this.#windowBound || typeof window === "undefined") return;
    this.#windowBound = true;
    window.addEventListener("offline", () => this.#disconnect());
    window.addEventListener("online", () => setTimeout(() => this.#reconnect(), 800));
  }

  #disconnect() {
    if (!this.connected) return;
    this.connected = false;
    this.#fireConnection("disconnect");
  }

  #reconnect() {
    if (this.connected || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    this.connected = true;
    this.#fireConnection("connect");
    const pending = this.#buffer;
    this.#buffer = [];
    pending.forEach(([event, payload]) => this.#push(event, payload));
  }

  /* --------------------------- request / accept flow --------------------------- */

  /** Called by the mock service after POST /sessions. */
  simulateRequest(sessionId, { outcome, expiresInSec = 20 } = {}) {
    const roll = Math.random();
    const result = outcome || (roll < 0.8 ? "accept" : roll < 0.9 ? "reject" : "timeout");
    const delay = result === "timeout" ? expiresInSec * 1000 : result === "reject" ? 3000 : ACCEPT_DELAY_MS;
    const id = setTimeout(() => {
      this.#requests.delete(sessionId);
      if (result === "accept") {
        const record = this.#activate(sessionId);
        this.#push(E.SESSION_ACCEPTED, { sessionId, mode: record.mode, startedAt: record.startedAt });
      } else if (result === "reject") {
        updateMockSession(sessionId, { status: "rejected" });
        this.#push(E.SESSION_REJECTED, { sessionId, reason: "busy" });
      } else {
        updateMockSession(sessionId, { status: "timeout" });
        this.#push(E.SESSION_TIMEOUT, { sessionId });
      }
    }, delay);
    this.#requests.set(sessionId, id);
  }

  cancelRequest(sessionId) {
    clearTimeout(this.#requests.get(sessionId));
    this.#requests.delete(sessionId);
    updateMockSession(sessionId, { status: "cancelled" });
  }

  /** Marks a pending session as live; billing starts from now. */
  #activate(sessionId) {
    const record = updateMockSession(sessionId, { status: "active", startedAt: now(), startBalance: getMockBalance() });
    if (record?.isFree) consumeMockFreeChat(); // one free chat per account, used once it starts
    return record;
  }

  /* ---------------------------------- waitlist ---------------------------------- */

  startQueue(queueId, { astrologer, mode, position }) {
    const q = { position, astrologer, mode, timer: null, expiry: null };
    this.#queues.set(queueId, q);
    const step = () => {
      q.position -= 1;
      if (q.position > 0) {
        this.#push(E.QUEUE_POSITION, { queueId, position: q.position, estimatedWaitSec: q.position * 4 * 60 });
        q.timer = setTimeout(step, QUEUE_STEP_MS);
        return;
      }
      const expiresAt = now() + QUEUE_ACCEPT_SECONDS * 1000;
      this.#push(E.QUEUE_YOUR_TURN, { queueId, acceptWindowSec: QUEUE_ACCEPT_SECONDS, expiresAt });
      q.expiry = setTimeout(() => {
        this.#queues.delete(queueId);
        this.#push(E.QUEUE_EXPIRED, { queueId });
      }, QUEUE_ACCEPT_SECONDS * 1000);
    };
    q.timer = setTimeout(step, QUEUE_STEP_MS);
  }

  leaveQueue(queueId) {
    const q = this.#queues.get(queueId);
    if (!q) return;
    clearTimeout(q.timer);
    clearTimeout(q.expiry);
    this.#queues.delete(queueId);
  }

  /** Accepting your turn creates an active session straight away. */
  acceptTurn(queueId, record) {
    const q = this.#queues.get(queueId);
    if (!q || q.position > 0) return null;
    this.leaveQueue(queueId);
    saveMockSession(record);
    return this.#activate(record.id);
  }

  /* ---------------------------------- live loop --------------------------------- */

  #join(sessionId) {
    const record = getMockSession(sessionId);
    if (!record) return;
    if (record.status === "ended") {
      this.#push(E.SESSION_ENDED, this.#endedPayload(record));
      return;
    }
    if (record.status !== "active" || this.#live.has(sessionId)) return;

    const live = { timer: null, replyIndex: getMockMessages(sessionId).filter((m) => m.from === "astrologer").length, timeouts: new Set(), freeEndedSent: false };
    this.#live.set(sessionId, live);

    if (record.mode === "chat" && getMockMessages(sessionId).length === 0) {
      this.#systemMessage(sessionId, record.isFree ? SYSTEM_MESSAGES.FREE_STARTED : SYSTEM_MESSAGES.STARTED, {
        minutes: Math.round(record.freeSeconds / 60),
        rate: record.ratePerMin,
      });
      this.#later(sessionId, () => this.#astrologerTyping(sessionId, `Namaste! I am ${record.astrologer.name}. How can I guide you today?`), 1200);
    }

    const tick = () => {
      this.#billingTick(sessionId);
      if (this.#live.has(sessionId)) live.timer = setTimeout(tick, BILLING_TICK_MS);
    };
    tick();
  }

  #stopLive(sessionId) {
    const live = this.#live.get(sessionId);
    if (!live) return;
    clearTimeout(live.timer);
    live.timeouts.forEach(clearTimeout);
    this.#live.delete(sessionId);
  }

  #later(sessionId, fn, ms) {
    const live = this.#live.get(sessionId);
    if (!live) return;
    const id = setTimeout(() => {
      live.timeouts.delete(id);
      fn();
    }, ms);
    live.timeouts.add(id);
  }

  /** Server-authoritative billing. Charges per second after the free period. */
  #compute(record, at = now()) {
    const elapsed = Math.max(0, (at - record.startedAt) / 1000);
    const freeRemaining = Math.max(0, record.freeSeconds - elapsed);
    const paidSeconds = Math.max(0, elapsed - record.freeSeconds);
    const perSecond = record.ratePerMin / 60;
    const charged = Math.round(paidSeconds * perSecond * 100) / 100;
    const balance = Math.max(0, Math.round((record.startBalance - charged) * 100) / 100);
    const secondsLeft = Math.floor(freeRemaining + balance / perSecond);
    return { elapsed: Math.floor(elapsed), freeRemaining: Math.ceil(freeRemaining), charged, balance, secondsLeft };
  }

  #billingTick(sessionId) {
    const record = getMockSession(sessionId);
    if (!record || record.status !== "active") return this.#stopLive(sessionId);
    const b = this.#compute(record);
    const live = this.#live.get(sessionId);

    if (record.isFree && b.freeRemaining === 0 && live && !live.freeEndedSent) {
      live.freeEndedSent = true;
      if (record.mode === "chat" && b.balance > 0) this.#systemMessage(sessionId, SYSTEM_MESSAGES.FREE_ENDED, { rate: record.ratePerMin });
    }

    if (b.secondsLeft <= 0) return this.end(sessionId, END_REASONS.BALANCE);

    this.#push(E.SESSION_BILLING, {
      sessionId,
      elapsed: b.elapsed,
      balance: b.balance,
      charged: b.charged,
      ratePerMin: record.ratePerMin,
      freeRemaining: b.freeRemaining,
      secondsLeft: b.secondsLeft,
      lowBalance: b.secondsLeft <= LOW_BALANCE_SECONDS,
    });
  }

  #endedPayload(record) {
    return {
      sessionId: record.id,
      reason: record.endReason,
      duration: record.duration,
      charged: record.charged,
      balance: record.endBalance,
    };
  }

  /** End a session for any reason — the single place a session finishes. */
  end(sessionId, reason = END_REASONS.USER) {
    this.#stopLive(sessionId);
    const record = getMockSession(sessionId);
    if (!record) return null;
    if (record.status === "ended") return this.#endedPayload(record);
    const endedAt = now();
    const b = record.startedAt ? this.#compute(record, endedAt) : { elapsed: 0, charged: 0, balance: getMockBalance() };
    const updated = updateMockSession(sessionId, {
      status: "ended",
      endedAt,
      endReason: reason,
      duration: b.elapsed,
      charged: b.charged,
      endBalance: b.balance,
    });
    setMockBalance(b.balance);
    const payload = this.#endedPayload(updated);
    this.#push(E.SESSION_ENDED, payload);
    return payload;
  }

  /* ------------------------------------ chat ------------------------------------ */

  #systemMessage(sessionId, code, params) {
    const message = { id: mockId("msg"), from: "system", code, params, createdAt: now() };
    upsertMockMessage(sessionId, message);
    this.#push(E.CHAT_MESSAGE, { sessionId, message });
  }

  #receiveUserMessage({ sessionId, clientId, text }) {
    const record = getMockSession(sessionId);
    if (!record || record.status !== "active") return { ok: false, error: "session_not_active" };
    const message = { id: mockId("msg"), clientId, from: "user", text: String(text).slice(0, 1000), createdAt: now(), status: "sent" };
    upsertMockMessage(sessionId, message);

    this.#later(sessionId, () => {
      markMockMessages(sessionId, [message.id], "delivered");
      this.#push(E.CHAT_DELIVERED, { sessionId, messageIds: [message.id] });
    }, 500);
    this.#later(sessionId, () => {
      markMockMessages(sessionId, [message.id], "read");
      this.#push(E.CHAT_READ, { sessionId, messageIds: [message.id] });
    }, 1400);

    // Reply to bursts once: reset the pending reply when the user keeps typing.
    const live = this.#live.get(sessionId);
    if (live) {
      clearTimeout(live.replyTimer);
      live.replyTimer = setTimeout(() => {
        if (!this.#live.has(sessionId)) return;
        const reply = REPLIES[live.replyIndex % REPLIES.length];
        live.replyIndex += 1;
        this.#astrologerTyping(sessionId, reply);
      }, 1800);
      live.timeouts.add(live.replyTimer);
    }
    return { ok: true, message };
  }

  #astrologerTyping(sessionId, text) {
    this.#push(E.CHAT_TYPING, { sessionId, from: "astrologer", typing: true });
    this.#later(sessionId, () => {
      this.#push(E.CHAT_TYPING, { sessionId, from: "astrologer", typing: false });
      const message = { id: mockId("msg"), from: "astrologer", text, createdAt: now() };
      upsertMockMessage(sessionId, message);
      this.#push(E.CHAT_MESSAGE, { sessionId, message });
    }, 1500 + Math.min(3500, text.length * 25));
  }

  /* ---------------------------- dev / QA controls ---------------------------- */

  dev = {
    dropConnection: (ms = 5000) => {
      this.#disconnect();
      setTimeout(() => this.#reconnect(), ms);
    },
    endByAstrologer: (sessionId) => this.end(sessionId, END_REASONS.ASTROLOGER),
    endByAdmin: (sessionId) => this.end(sessionId, END_REASONS.ADMIN),
    /** Leave ~90 seconds of balance so the low-balance flow can be seen. */
    drainBalance: (sessionId) => {
      const record = getMockSession(sessionId);
      if (!record?.startedAt) return;
      const b = this.#compute(record);
      const target = (record.ratePerMin / 60) * 90;
      updateMockSession(sessionId, { startBalance: record.startBalance - Math.max(0, b.balance - target), freeSeconds: Math.min(record.freeSeconds, b.elapsed) });
      this.#billingTick(sessionId);
    },
    skipFreeTime: (sessionId) => {
      const record = getMockSession(sessionId);
      if (!record?.startedAt) return;
      updateMockSession(sessionId, { freeSeconds: Math.min(record.freeSeconds, this.#compute(record).elapsed) });
      this.#billingTick(sessionId);
    },
    expireLogin: () => window.dispatchEvent(new CustomEvent("auth:expired")),
  };
}

/** One engine per tab, like the socket singleton (kept on globalThis so dev hot-reloads reuse it). */
export const mockSessionEngine = (globalThis.__mockSessionEngine ??= new MockSessionEngine());
