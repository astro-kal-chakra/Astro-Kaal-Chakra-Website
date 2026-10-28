/**
 * Astrologer Training Academy — DEMO catalogue until the backend provides courses, enrolment and live rooms.
 * Lesson videos use a public sample clip; study material is generated as a text file on download.
 */

const SAMPLE_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const lesson = (id, title, duration) => ({ id, title, duration, video: SAMPLE_VIDEO });

export const COURSES = [
  {
    slug: "vedic-astrology-foundation",
    title: "Vedic Astrology Foundation",
    level: "Beginner",
    tone: "from-brand-500 to-brand-700",
    glyph: "☉",
    summary: "Planets, signs, houses and nakshatras — read your first birth chart with confidence.",
    trainer: { name: "Acharya Vikram Shastri", role: "Vedic astrologer · 18 yrs" },
    hours: 12,
    students: 2140,
    rating: 4.8,
    live: { day: "Every Saturday", time: "7:00 PM IST", length: "60 min" },
    outcomes: ["Cast and read a Lagna (birth) chart", "Understand the 9 grahas and 12 bhavas", "Identify yogas and doshas", "Give a basic reading to a client"],
    modules: [
      { title: "Getting started", lessons: [lesson("v1", "What is Jyotish?", "08:12"), lesson("v2", "The zodiac and the 12 rashis", "14:40")] },
      { title: "Planets & houses", lessons: [lesson("v3", "The 9 grahas and their nature", "18:05"), lesson("v4", "The 12 bhavas (houses)", "16:30"), lesson("v5", "Lordships and aspects", "12:20")] },
      { title: "Reading a chart", lessons: [lesson("v6", "Nakshatras made simple", "15:10"), lesson("v7", "Your first chart reading", "21:45")] },
    ],
    resources: [
      { name: "Planets & signs cheat sheet", kind: "Notes", content: "Sun – Leo, Moon – Cancer, Mars – Aries/Scorpio, Mercury – Gemini/Virgo, Jupiter – Sagittarius/Pisces, Venus – Taurus/Libra, Saturn – Capricorn/Aquarius." },
      { name: "12 houses quick guide", kind: "Notes", content: "1 Self · 2 Wealth · 3 Courage · 4 Home · 5 Children · 6 Health · 7 Marriage · 8 Longevity · 9 Fortune · 10 Career · 11 Gains · 12 Losses." },
      { name: "Practice worksheet", kind: "Worksheet", content: "Cast your own chart and note the Lagna, Moon sign and the planet in the 10th house." },
    ],
  },
  {
    slug: "kp-astrology-mastery",
    title: "KP Astrology Mastery",
    level: "Intermediate",
    tone: "from-amber-500 to-amber-700",
    glyph: "✦",
    summary: "Krishnamurti Paddhati: cusps, sub-lords and precise event timing.",
    trainer: { name: "Dr. Meera Iyer", role: "KP specialist · 14 yrs" },
    hours: 16,
    students: 980,
    rating: 4.7,
    live: { day: "Every Sunday", time: "11:00 AM IST", length: "75 min" },
    outcomes: ["Work with Placidus cusps", "Use star and sub lords", "Judge significators", "Time events with dashas"],
    modules: [
      { title: "KP basics", lessons: [lesson("k1", "Why KP?", "10:05"), lesson("k2", "Cusps and sub-lords", "19:30")] },
      { title: "Significators", lessons: [lesson("k3", "Four-step significators", "22:10"), lesson("k4", "Ruling planets", "17:45")] },
      { title: "Event timing", lessons: [lesson("k5", "Dasha and transit timing", "24:00")] },
    ],
    resources: [
      { name: "Sub-lord table", kind: "Notes", content: "Each nakshatra is divided into 9 unequal parts in the Vimshottari proportion; the lord of each part is the sub-lord." },
      { name: "Significator worksheet", kind: "Worksheet", content: "List the planets in the star of the occupants and owners of the 2nd, 7th and 11th cusps." },
    ],
  },
  {
    slug: "tarot-reading-professional",
    title: "Professional Tarot Reading",
    level: "Beginner",
    tone: "from-violet-500 to-violet-700",
    glyph: "☾",
    summary: "All 78 cards, classic spreads and how to run a confident client session.",
    trainer: { name: "Riya Kapoor", role: "Tarot reader · 9 yrs" },
    hours: 10,
    students: 1560,
    rating: 4.9,
    live: { day: "Every Wednesday", time: "8:00 PM IST", length: "60 min" },
    outcomes: ["Know the Major and Minor Arcana", "Use 3-card and Celtic Cross spreads", "Read reversals", "Handle client questions ethically"],
    modules: [
      { title: "The cards", lessons: [lesson("t1", "Major Arcana", "20:15"), lesson("t2", "Minor Arcana suits", "18:40")] },
      { title: "Spreads", lessons: [lesson("t3", "Three-card spread", "11:30"), lesson("t4", "Celtic Cross", "16:50")] },
      { title: "Client sessions", lessons: [lesson("t5", "Running a reading", "14:25")] },
    ],
    resources: [{ name: "Card meanings summary", kind: "Notes", content: "The Fool – new beginnings · The Magician – willpower · The High Priestess – intuition · The Empress – abundance." }],
  },
  {
    slug: "numerology-essentials",
    title: "Numerology Essentials",
    level: "Beginner",
    tone: "from-emerald-500 to-emerald-700",
    glyph: "९",
    summary: "Life path, destiny and name numbers — calculate and interpret like a pro.",
    trainer: { name: "Pandit Anil Sharma", role: "Numerologist · 21 yrs" },
    hours: 8,
    students: 1290,
    rating: 4.6,
    live: { day: "Every Friday", time: "6:30 PM IST", length: "45 min" },
    outcomes: ["Calculate core numbers", "Interpret 1–9 and master numbers", "Name correction basics", "Lucky numbers and dates"],
    modules: [
      { title: "Core numbers", lessons: [lesson("n1", "Life path number", "12:00"), lesson("n2", "Destiny and soul numbers", "15:20")] },
      { title: "Applications", lessons: [lesson("n3", "Name correction", "13:45"), lesson("n4", "Lucky dates and colours", "09:30")] },
    ],
    resources: [{ name: "Number meanings 1–9", kind: "Notes", content: "1 Leadership · 2 Harmony · 3 Expression · 4 Stability · 5 Freedom · 6 Care · 7 Wisdom · 8 Power · 9 Compassion." }],
  },
];

export const courseBySlug = (slug) => COURSES.find((c) => c.slug === slug);
export const allLessons = (course) => course.modules.flatMap((m) => m.lessons);
