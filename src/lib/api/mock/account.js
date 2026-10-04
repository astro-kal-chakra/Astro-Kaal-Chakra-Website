/**
 * Mock data for the logged-in account area (removed once the backend is live).
 * Writes persist to localStorage so the UI feels real across reloads.
 */
import { MOCK_ASTROLOGERS } from "./astrologers";

const PREFIX = "mock_account:";
const DAY = 24 * 60 * 60 * 1000;

export const daysAgo = (d, hours = 0) => new Date(Date.now() - d * DAY - hours * 60 * 60 * 1000).toISOString();
export const mockId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
export const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

/**
 * Tiny persisted store. `seed` is a function so relative dates are computed
 * on first use and then frozen in localStorage.
 */
export function mockStore(key, seed) {
  const storageKey = PREFIX + key;
  return {
    get() {
      if (typeof window === "undefined") return seed();
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) return JSON.parse(raw);
      } catch {}
      const initial = seed();
      this.set(initial);
      return clone(initial);
    },
    set(value) {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {}
    },
    update(fn) {
      const next = fn(this.get());
      this.set(next);
      return clone(next);
    },
  };
}

/** Clears every mock account key (used by mock "delete account"). */
export function clearMockAccount() {
  if (typeof window === "undefined") return;
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

const astroRef = (i) => {
  const a = MOCK_ASTROLOGERS[i % MOCK_ASTROLOGERS.length];
  return { id: a.id, slug: a.slug, name: a.name, avatarUrl: a.avatarUrl };
};

/* ---------------------------- Session history ---------------------------- */

// Billed by the second at the rate of the time: 03:01 at ₹12/min = ₹36.20. Each started
// minute was held in advance; the unused part (₹48 held − ₹36.20 = ₹11.80) went back to the wallet.
const SESSION_SEED = [
  // [astroIdx, mode, daysAgo, durationSec, ratePerMin, status]
  [0, "chat", 0.2, 181, 12, "completed"],
  [3, "video", 1, 1262, 72, "completed"],
  [2, "chat", 3, 0, 30, "missed"],
  [6, "chat", 5, 412, 35, "refunded"],
  [1, "call", 8, 905, 25, "completed"],
  [4, "chat", 12, 1830, 20, "completed"],
  [8, "video", 20, 0, 80, "missed"],
  [10, "chat", 34, 180, 0, "completed"], // free first chat (3 minutes)
];

const round2 = (n) => Math.round(n * 100) / 100;

export const MOCK_SESSIONS = () =>
  SESSION_SEED.map(([ai, mode, d, durationSec, ratePerMin, status], i) => {
    const isFree = ratePerMin === 0 && status === "completed";
    const totalCharged = round2((ratePerMin * durationSec) / 60);
    const held = Math.ceil(durationSec / 60) * ratePerMin;
    return {
      id: `ses_${1001 + i}`,
      mode, // "chat" | "call" | "video"
      astrologer: astroRef(ai),
      startedAt: daysAgo(d, i),
      durationSec,
      ratePerMin,
      totalCharged,
      unusedReturned: round2(held - totalCharged),
      status,
      isFree,
      hasTranscript: mode === "chat" && durationSec > 0,
      hasSummary: status === "completed",
    };
  });

export const mockTranscript = (session) => {
  const t0 = new Date(session.startedAt).getTime();
  const at = (min) => new Date(t0 + min * 60 * 1000).toISOString();
  return [
    { id: "m1", from: "system", text: "Session started", at: at(0) },
    { id: "m2", from: "astrologer", text: "Namaste! I have your birth details. What would you like to ask today?", at: at(0.2) },
    { id: "m3", from: "user", text: "I want to know about my career. Will I get a job change this year?", at: at(1) },
    {
      id: "m4",
      from: "astrologer",
      text: "Your 10th house lord is well placed and Jupiter's transit supports growth. The period after mid-November looks favourable for a change.",
      at: at(2.5),
    },
    { id: "m5", from: "user", text: "Should I wait or start applying now?", at: at(4) },
    {
      id: "m6",
      from: "astrologer",
      text: "Start preparing and applying now. Offers are likely to materialise in the favourable window. Chant the Gayatri mantra on Sundays.",
      at: at(5.5),
    },
    { id: "m7", from: "user", text: "Thank you so much!", at: at(7) },
    { id: "m8", from: "system", text: "Session ended", at: at(Math.max(8, session.durationSec / 60)) },
  ];
};

/* --------------------------- Followed astrologers ------------------------ */

export const MOCK_FOLLOWING_IDS = () => ["astro_1", "astro_3", "astro_4", "astro_7", "astro_9"];

/* ----------------------------- Birth profiles ---------------------------- */

const place = (name, region, lat, lng) => ({ id: name.toLowerCase(), name, region, lat, lng, timezone: "Asia/Kolkata" });

export const MOCK_BIRTH_PROFILES = () => [
  {
    id: "bp_1",
    name: "Priya Sharma",
    relation: "spouse",
    gender: "female",
    dob: "1993-04-18",
    tob: "06:45",
    place: place("Jaipur", "Rajasthan, India", 26.91, 75.79),
    createdAt: daysAgo(40),
  },
  {
    id: "bp_2",
    name: "Ramesh Kumar",
    relation: "parent",
    gender: "male",
    dob: "1962-11-02",
    tob: null,
    place: place("Lucknow", "Uttar Pradesh, India", 26.85, 80.95),
    createdAt: daysAgo(25),
  },
];

/* ------------------------------ Saved kundlis ---------------------------- */

export const MOCK_SAVED_KUNDLIS = () => [
  {
    id: "kd_1",
    type: "kundli",
    name: "Priya Sharma",
    dob: "1993-04-18",
    tob: "06:45",
    place: "Jaipur, Rajasthan",
    sign: "aries",
    createdAt: daysAgo(2),
  },
  {
    id: "kd_2",
    type: "matching",
    name: "Rahul & Priya",
    dob: "1991-09-07",
    tob: "14:20",
    place: "Delhi",
    score: 27,
    createdAt: daysAgo(9),
  },
  {
    id: "kd_3",
    type: "kundli",
    name: "Ramesh Kumar",
    dob: "1962-11-02",
    tob: null,
    place: "Lucknow, Uttar Pradesh",
    sign: "scorpio",
    createdAt: daysAgo(21),
  },
];

/* -------------------------------- Referral ------------------------------- */

export const MOCK_REFERRAL = () => ({
  code: "NAKSH7K2Q",
  rewardPerReferral: 50, // backend referral.referrerReward / refereeReward
  friendReward: 30,
  rewards: [
    { id: "rw_1", friendName: "Ankit S.", joinedAt: daysAgo(3), amount: 50, status: "credited" },
    { id: "rw_2", friendName: "Neha P.", joinedAt: daysAgo(6), amount: 50, status: "pending" },
    { id: "rw_3", friendName: "Vivek R.", joinedAt: daysAgo(18), amount: 50, status: "credited" },
  ],
});

/* --------------------------------- Privacy ------------------------------- */

export const MOCK_PRIVACY = () => ({ marketingConsent: false, dataExportRequestedAt: null });
