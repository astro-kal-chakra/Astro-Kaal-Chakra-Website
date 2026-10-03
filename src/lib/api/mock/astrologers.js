/**
 * Local mock data used until NEXT_PUBLIC_API_URL is configured.
 * Shape mirrors what the backend /astrologers endpoint should return.
 * Note: no phone numbers or contact details — ever.
 */
const NAMES = [
  "Acharya Vikram Shastri", "Pandit Rajesh Mishra", "Tarot Meera", "Dr. Ananya Rao",
  "Acharya Neha Joshi", "Guru Harish Iyer", "Pandit Suresh Tiwari", "Numerologist Kavya",
  "Acharya Deepak Sharma", "Vastu Expert Ritu", "Pandit Arjun Pathak", "Astro Sneha",
  "Acharya Manoj Dubey", "Tarot Reader Isha", "Pandit Gopal Krishna", "Dr. Lakshmi Menon",
];

const SPECIALTY_SETS = [
  ["Vedic", "KP"], ["Vedic", "Prashna"], ["Tarot"], ["Vedic", "Numerology"],
  ["Vedic", "Palmistry"], ["KP", "Vedic"], ["Vedic", "Vastu"], ["Numerology"],
  ["Vedic"], ["Vastu", "Numerology"], ["Vedic", "Face Reading"], ["Tarot", "Numerology"],
  ["Vedic", "KP"], ["Tarot"], ["Vedic", "Prashna"], ["Vedic", "Palmistry"],
];

const LANGUAGE_SETS = [
  ["Hindi", "English"], ["Hindi"], ["English", "Hindi"], ["English", "Telugu"],
  ["Hindi", "Marathi"], ["Tamil", "English"], ["Hindi"], ["English", "Hindi", "Gujarati"],
  ["Hindi", "Punjabi"], ["Hindi", "English"], ["Hindi"], ["Bengali", "English"],
  ["Hindi"], ["English"], ["Hindi", "English"], ["Tamil", "English"],
];

const CATEGORY_SETS = [
  ["love", "marriage"], ["career", "finance"], ["love"], ["health", "career"],
  ["marriage"], ["career"], ["finance", "career"], ["love", "career"],
  ["marriage", "love"], ["finance"], ["health"], ["love", "marriage"],
  ["career"], ["love"], ["marriage", "finance"], ["health", "marriage"],
];

const STATUSES = ["online", "online", "busy", "online", "offline", "busy", "online", "offline"];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const MOCK_ASTROLOGERS = NAMES.map((name, i) => {
  const chatPrice = [15, 25, 30, 45, 20, 60, 35, 18, 50, 40, 22, 28, 75, 32, 55, 120][i];
  const status = STATUSES[i % STATUSES.length];
  return {
    id: `astro_${i + 1}`,
    slug: slugify(name),
    name,
    avatarUrl: null,
    specialties: SPECIALTY_SETS[i],
    categories: CATEGORY_SETS[i],
    languages: LANGUAGE_SETS[i],
    experienceYears: 3 + ((i * 7) % 20),
    rating: Math.round((4.2 + ((i * 13) % 8) / 10) * 10) / 10,
    reviewCount: 120 + ((i * 397) % 4800),
    totalSessions: 1500 + ((i * 2731) % 52000),
    chatPrice,
    videoPrice: Math.round(chatPrice * 1.6),
    supportsVideo: i % 3 !== 2,
    status,
    queueCount: status === "busy" ? 1 + (i % 4) : 0,
    isVerified: true,
    freeChatEligible: i % 2 === 0,
    about:
      `${name} has guided thousands of people through life's important decisions with clear, practical astrology. ` +
      "Sessions focus on understanding your chart and giving honest, actionable guidance — never fear-based remedies.",
    popularity: 100 - i * 3,
  };
});

export const MOCK_REVIEWS = [
  { id: "r1", user: "Priya S.", rating: 5, text: "Very accurate and calm. Helped me decide on my job switch.", date: "2026-09-21" },
  { id: "r2", user: "Rahul K.", rating: 5, text: "Explained my chart clearly without scaring me. Will consult again.", date: "2026-09-12" },
  { id: "r3", user: "Anjali M.", rating: 4, text: "Good guidance on marriage timing. Session was smooth.", date: "2026-08-30" },
  { id: "r4", user: "Vikas T.", rating: 5, text: "Free first chat was genuinely helpful. Recharged after that.", date: "2026-08-18" },
];
