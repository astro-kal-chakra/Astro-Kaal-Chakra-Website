/**
 * MOCK SESSION ENGINE — stands in for the backend + Socket.io while
 * NEXT_PUBLIC_API_URL is not configured. Everything "server-side" about a live
 * consultation is simulated here, in one place:
 *
 *   - request → accept (session:start) / reject / missed after 30s
 *   - waitlist position updates, the 60-second turn offer, accept / decline / expiry
 *   - server-authoritative billing (session:tick, wallet:low) and session:end
 *   - chat delivery / read receipts, astrologer typing + replies
 *   - connection drops (also follows the browser's online/offline events)
 *
 * Billing follows the backend: each started minute is held from the wallet in
 * advance, the user pays the exact time by the second, and the unused part of
 * the last held minute goes back to the wallet when the session ends. A free
 * first chat simply ends when its minutes are over.
 *
 * It exposes the same surface the UI uses on a socket.io client
 * (`on`, `off`, `emit(event, payload, ack)`, `connected`) and pushes events with
 * the same names/payloads as SOCKET_EVENTS, so swapping in the real socket is a
 * one-line change in useSessionTransport().
 */

import { CLIENT_EVENTS as C, SOCKET_EVENTS as E, SIGNED_IN_ELSEWHERE } from "@/lib/socket/events";
import {
  consumeMockFreeChat,
  getMockBalance,
  getMockMessages,
  getMockSession,
  markMockMessages,
  mockId,
  recordMockConsultation,
  saveMockSession,
  setMockBalance,
  updateMockSession,
  upsertMockMessage,
} from "@/lib/api/mock/session";
import { END_REASONS, LOW_BALANCE_MINUTES, QUEUE_ACCEPT_SECONDS, REQUEST_TIMEOUT_SECONDS, SYSTEM_MESSAGES } from "./sessionEvents";

// The real server ticks once a minute; the mock ticks more often so the UI updates quickly.
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
const round2 = (n) => Math.round(n * 100) / 100;
/** Exact cost of `seconds` at `ratePerMin`, to the paisa (backend costFor). 3:01 at ₹12/min = ₹36.20. */
export const costFor = (ratePerMin, seconds) => round2((ratePerMin * Math.max(0, seconds)) / 60);

class MockSessionEngine {
  connected = true;
  #listeners = new Map();
  #buffer = [];
  #live = new Map(); // sessionId -> { timer, replyIndex, timeouts:Set, lowSentAt }
  #requests = new Map(); // sessionId -> timeout id
  #queues = new Map(); // entryId -> { timer, position, astrologer, mode, expiry }
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
      case C.SESSION_JOIN:
        this.#join(payload.sessionId);
        ack?.({ ok: true });
        break;
      case C.SESSION_END:
        ack?.({ ok: true, data: this.end(payload.sessionId, END_REASONS.USER) });
        break;
      case C.CHAT_SEND:
        ack?.(this.#receiveUserMessage(payload));
        break;
      case C.CHAT_READ:
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

  /** Called by the mock service after POST /user/sessions/request. */
  simulateRequest(sessionId, { outcome, expiresInSec = REQUEST_TIMEOUT_SECONDS } = {}) {
    const roll = Math.random();
    const result = outcome === "timeout" ? "missed" : outcome || (roll < 0.8 ? "accept" : roll < 0.9 ? "reject" : "missed");
    const delay = result === "missed" ? expiresInSec * 1000 : result === "reject" ? 3000 : ACCEPT_DELAY_MS;
    const id = setTimeout(() => {
      this.#requests.delete(sessionId);
      if (result === "accept") {
        const record = this.#activate(sessionId);
        if (record?.status !== "active") return; // the first minute couldn't be held
        this.#push(E.SESSION_START, this.#startPayload(record));
      } else if (result === "reject") {
        updateMockSession(sessionId, { status: "rejected" });
        this.#push(E.SESSION_REJECTED, { sessionId, reason: "rejected_by_astrologer", suggestions: [] });
      } else {
        updateMockSession(sessionId, { status: "missed" });
        this.#push(E.SESSION_MISSED, { sessionId, reason: "timeout", suggestions: [] });
      }
    }, delay);
    this.#requests.set(sessionId, id);
  }

  cancelRequest(sessionId) {
    clearTimeout(this.#requests.get(sessionId));
    this.#requests.delete(sessionId);
    updateMockSession(sessionId, { status: "cancelled" });
  }

  /** Marks a pending session as live; paid sessions hold the first minute right away. */
  #activate(sessionId) {
    const record = getMockSession(sessionId);
    if (!record) return null;
    if (record.isFree) {
      consumeMockFreeChat(); // one free chat per account / device, used once it starts
      return updateMockSession(sessionId, { status: "active", startedAt: now(), billedMinutes: 1, totalHeld: 0 });
    }
    const balance = getMockBalance();
    if (balance < record.ratePerMin) return updateMockSession(sessionId, { status: "failed", endReason: END_REASONS.BALANCE });
    setMockBalance(balance - record.ratePerMin);
    return updateMockSession(sessionId, { status: "active", startedAt: now(), billedMinutes: 1, totalHeld: record.ratePerMin });
  }

  #startPayload(record) {
    return {
      sessionId: record.id,
      mode: record.mode,
      startedAt: record.startedAt,
      ratePerMin: record.ratePerMin,
      isFree: record.isFree,
      freeMinutes: record.freeMinutes,
      balance: getMockBalance(),
    };
  }

  /* ---------------------------------- waitlist ---------------------------------- */

  startQueue(entryId, { astrologer, mode, position }) {
    const q = { position, astrologer, mode, timer: null, expiry: null };
    this.#queues.set(entryId, q);
    const step = () => {
      q.position -= 1;
      if (q.position > 0) {
        this.#push(E.QUEUE_POSITION, { entryId, position: q.position, estimatedWaitSec: q.position * 4 * 60 });
        q.timer = setTimeout(step, QUEUE_STEP_MS);
        return;
      }
      const expiresAt = now() + QUEUE_ACCEPT_SECONDS * 1000;
      this.#push(E.QUEUE_OFFER, { entryId, mode, expiresAt, seconds: QUEUE_ACCEPT_SECONDS, astrologer: { id: astrologer.id, name: astrologer.name } });
      q.expiry = setTimeout(() => {
        this.#queues.delete(entryId);
        this.#push(E.QUEUE_SKIPPED, { entryId, reason: "offer_expired", suggestions: [] });
      }, QUEUE_ACCEPT_SECONDS * 1000);
    };
    q.timer = setTimeout(step, QUEUE_STEP_MS);
  }

  leaveQueue(entryId) {
    const q = this.#queues.get(entryId);
    if (!q) return;
    clearTimeout(q.timer);
    clearTimeout(q.expiry);
    this.#queues.delete(entryId);
  }

  /** Declining the offer passes the turn to the next person (backend queue:decline). */
  declineTurn(entryId) {
    this.leaveQueue(entryId);
  }

  /** Accepting your turn creates an active session straight away. */
  acceptTurn(entryId, record) {
    const q = this.#queues.get(entryId);
    if (!q || q.position > 0) return null;
    this.leaveQueue(entryId);
    saveMockSession(record);
    const started = this.#activate(record.id);
    if (started?.status === "active") this.#push(E.QUEUE_ACCEPTED, { entryId, sessionId: started.id, status: started.status });
    return started;
  }

  /* ---------------------------------- live loop --------------------------------- */

  #join(sessionId) {
    const record = getMockSession(sessionId);
    if (!record) return;
    if (record.status === "completed") {
      this.#push(E.SESSION_END, this.#endedPayload(record));
      return;
    }
    if (record.status !== "active" || this.#live.has(sessionId)) return;

    const live = { timer: null, replyIndex: getMockMessages(sessionId).filter((m) => m.from === "astrologer").length, timeouts: new Set(), lowSentAt: 0 };
    this.#live.set(sessionId, live);

    if (record.mode === "chat" && getMockMessages(sessionId).length === 0) {
      this.#systemMessage(sessionId, record.isFree ? SYSTEM_MESSAGES.FREE_STARTED : SYSTEM_MESSAGES.STARTED, {
        minutes: record.freeMinutes,
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

  #elapsed(record, at = now()) {
    return Math.max(0, Math.floor((at - record.startedAt) / 1000));
  }

  /**
   * Server-authoritative billing. Holds each minute as soon as it starts and
   * ends the session when the wallet can't cover it (or when free time is over).
   */
  #billingTick(sessionId) {
    let record = getMockSession(sessionId);
    if (!record || record.status !== "active") return this.#stopLive(sessionId);
    const elapsedSec = this.#elapsed(record);
    const live = this.#live.get(sessionId);

    if (record.isFree) {
      const freeLeft = record.freeMinutes * 60 - elapsedSec;
      if (freeLeft <= 0) return this.end(sessionId, END_REASONS.FREE_OVER);
      if (freeLeft <= 60 && live && !live.lowSentAt) {
        live.lowSentAt = now();
        this.#push(E.WALLET_LOW, { sessionId, freeSession: true, minutesLeft: 0, balance: getMockBalance() });
      }
      this.#push(E.SESSION_TICK, { sessionId, elapsedSec, billedMinutes: Math.floor(elapsedSec / 60) + 1, totalCharged: 0, balance: getMockBalance(), minutesLeft: null });
      return;
    }

    // Hold every minute that has started.
    const needed = Math.floor(elapsedSec / 60) + 1;
    let held = false;
    while (record.billedMinutes < needed) {
      const balance = getMockBalance();
      if (balance < record.ratePerMin) return this.end(sessionId, END_REASONS.BALANCE);
      setMockBalance(balance - record.ratePerMin);
      record = updateMockSession(sessionId, { billedMinutes: record.billedMinutes + 1, totalHeld: round2(record.totalHeld + record.ratePerMin) });
      held = true;
    }

    const balance = getMockBalance();
    const minutesLeft = Math.floor(balance / record.ratePerMin);
    if (minutesLeft < LOW_BALANCE_MINUTES && live && (held || !live.lowSentAt)) {
      live.lowSentAt = now();
      const endsInSeconds = (record.billedMinutes + minutesLeft) * 60 - elapsedSec;
      this.#push(E.WALLET_LOW, { sessionId, balance, minutesLeft, ratePerMin: record.ratePerMin, endsInSeconds });
    }

    this.#push(E.SESSION_TICK, {
      sessionId,
      elapsedSec,
      billedMinutes: record.billedMinutes,
      totalCharged: costFor(record.ratePerMin, elapsedSec), // by the second; held minutes are only a deposit
      balance,
      minutesLeft,
    });
  }

  #endedPayload(record) {
    return {
      sessionId: record.id,
      reason: record.endReason,
      durationSec: record.durationSec,
      billedMinutes: record.billedMinutes,
      totalCharged: record.totalCharged,
      unusedReturned: record.unusedReturned,
      isFree: record.isFree,
      balance: record.endBalance,
    };
  }

  /** End a session for any reason — the single place a session finishes (backend finish + settle). */
  end(sessionId, reason = END_REASONS.USER) {
    this.#stopLive(sessionId);
    const record = getMockSession(sessionId);
    if (!record) return null;
    if (record.status === "completed") return this.#endedPayload(record);
    const endedAt = now();
    let durationSec = 0;
    let totalCharged = 0;
    let unusedReturned = 0;
    if (record.startedAt && record.status === "active") {
      durationSec = this.#elapsed(record, endedAt);
      if (record.isFree) durationSec = Math.min(durationSec, record.freeMinutes * 60);
      else {
        // Pay the exact time; the rest of the held minutes goes back to the wallet.
        totalCharged = Math.min(record.totalHeld, costFor(record.ratePerMin, durationSec));
        unusedReturned = round2(record.totalHeld - totalCharged);
        if (unusedReturned > 0) setMockBalance(getMockBalance() + unusedReturned);
      }
    }
    const updated = updateMockSession(sessionId, {
      status: "completed",
      endedAt,
      endReason: reason,
      durationSec,
      totalCharged,
      unusedReturned,
      endBalance: getMockBalance(),
    });
    recordMockConsultation(updated);
    const payload = this.#endedPayload(updated);
    this.#push(E.SESSION_END, payload);
    return payload;
  }

  /* ------------------------------------ chat ------------------------------------ */

  #systemMessage(sessionId, code, params) {
    const message = { id: mockId("msg"), from: "system", code, params, createdAt: now() };
    upsertMockMessage(sessionId, message);
    this.#push(E.CHAT_MESSAGE, { sessionId, message });
  }

  #receiveUserMessage({ sessionId, clientMsgId, text }) {
    const record = getMockSession(sessionId);
    if (!record || record.status !== "active") return { ok: false, error: "session_not_active" };
    const message = { id: mockId("msg"), clientId: clientMsgId, from: "user", text: String(text).slice(0, 1000), createdAt: now(), status: "sent" };
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
    this.#push(E.CHAT_TYPING, { sessionId, role: "astrologer", isTyping: true });
    this.#later(sessionId, () => {
      this.#push(E.CHAT_TYPING, { sessionId, role: "astrologer", isTyping: false });
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
    /** Leave about 1.5 minutes in the wallet so the low-balance flow can be seen. */
    drainBalance: (sessionId) => {
      const record = getMockSession(sessionId);
      if (!record?.startedAt || record.isFree) return;
      const live = this.#live.get(sessionId);
      if (live) live.lowSentAt = 0;
      setMockBalance(Math.min(getMockBalance(), record.ratePerMin * 1.5));
      this.#billingTick(sessionId);
    },
    /** Free chat: jump to the end of the free minutes. */
    skipFreeTime: (sessionId) => this.end(sessionId, END_REASONS.FREE_OVER),
    expireLogin: () => window.dispatchEvent(new CustomEvent("auth:expired")),
    /** Same as the server's auth:signed_out when this account signs in on another device. */
    signInElsewhere: () => {
      this.#push(E.AUTH_SIGNED_OUT, { reason: SIGNED_IN_ELSEWHERE });
      window.dispatchEvent(new CustomEvent("auth:signed_out", { detail: { reason: SIGNED_IN_ELSEWHERE } }));
    },
  };
}

/** One engine per tab, like the socket singleton (kept on globalThis so dev hot-reloads reuse it). */
export const mockSessionEngine = (globalThis.__mockSessionEngine ??= new MockSessionEngine());
