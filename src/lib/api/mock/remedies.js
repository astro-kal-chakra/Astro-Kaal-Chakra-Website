/**
 * Mock data for paid remedies (removed once the backend is live).
 * Shapes follow the website API (/web/remedies, money in rupees).
 */
import { MOCK_ASTROLOGERS } from "./astrologers";

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export const MOCK_REMEDY_CONFIG = {
  enabled: true,
  available: true,
  price: 299,
  deliveryHours: 72,
  followUpDays: 7,
  categories: ["career", "marriage", "love", "health", "finance", "education", "family", "business", "legal", "kids", "other"],
  itemTypes: ["mantra", "puja", "gemstone", "rudraksha", "yantra", "donation", "fasting", "lal_kitab", "lifestyle", "other"],
};

export const mockAstroCard = (a) => ({ id: a.id, name: a.name, avatar: a.avatarUrl || null, slug: a.slug });

const iso = (ms) => (ms ? new Date(ms).toISOString() : null);

/** Seed: one delivered (unread), one pending, one expired (refunded). Dates are frozen on first use. */
export const MOCK_REMEDIES = () => {
  const now = Date.now();
  const [a1, a2, a3] = [MOCK_ASTROLOGERS[0], MOCK_ASTROLOGERS[2], MOCK_ASTROLOGERS[4]];
  return [
    {
      id: "rm_seed_1",
      code: "RM500001",
      status: "delivered",
      category: "career",
      question: "I have been trying to change my job for a year but every interview ends in a rejection. What should I do?",
      language: "en",
      astrologer: mockAstroCard(a1),
      forName: "Rahul Verma",
      price: 299,
      createdAt: iso(now - 3 * DAY),
      dueAt: iso(now - 3 * DAY + 72 * HOUR),
      deliveredAt: iso(now - 1 * DAY),
      remedy: {
        message:
          "Saturn is transiting your 10th house, which slows results at work but rewards steady effort. The next few months improve after mid-January. Follow these simple remedies with faith and patience.",
        items: [
          { type: "mantra", title: "Shani Beej Mantra", details: "Om Praam Preem Praum Sah Shanaischaraya Namah", when: "Every Saturday at sunrise", duration: "108 times, for 11 Saturdays" },
          { type: "donation", title: "Donate black sesame and mustard oil", details: "Give to a needy person or at a Shani temple.", when: "Saturdays" },
          { type: "gemstone", title: "Blue sapphire is not advised for now", details: "Wear an amethyst in silver on the middle finger instead.", when: "Start on a Saturday morning" },
          { type: "lifestyle", title: "Respect elders and workers", details: "Help a senior colleague or worker without being asked." },
        ],
      },
      declineReason: null,
      refund: null,
      followUp: null,
      rating: null,
      review: null,
      unread: true,
      openedAt: iso(now - 2 * DAY),
    },
    {
      id: "rm_seed_2",
      code: "RM500002",
      status: "pending",
      category: "marriage",
      question: "When will my marriage happen? My family has been looking for a match for two years.",
      language: "en",
      astrologer: mockAstroCard(a2),
      forName: "Priya Sharma",
      price: 299,
      createdAt: iso(now - 5 * HOUR),
      dueAt: iso(now - 5 * HOUR + 72 * HOUR),
      deliveredAt: null,
      remedy: null,
      declineReason: null,
      refund: null,
      followUp: null,
      rating: null,
      review: null,
      unread: false,
      openedAt: null,
    },
    {
      id: "rm_seed_3",
      code: "RM500003",
      status: "expired",
      category: "health",
      question: "My father has frequent health problems. Is there a remedy to improve his health?",
      language: "en",
      astrologer: mockAstroCard(a3),
      forName: "Ramesh Kumar",
      price: 299,
      createdAt: iso(now - 12 * DAY),
      dueAt: iso(now - 9 * DAY),
      deliveredAt: null,
      remedy: null,
      declineReason: null,
      refund: { amount: 299, at: iso(now - 9 * DAY), by: "system" },
      followUp: null,
      rating: null,
      review: null,
      unread: false,
      openedAt: null,
    },
  ];
};
