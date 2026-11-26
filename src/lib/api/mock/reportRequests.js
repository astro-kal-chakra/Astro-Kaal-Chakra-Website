/**
 * Mock data for "Get a report from an astrologer" (used while NEXT_PUBLIC_API_URL is not set).
 * Shapes follow the website API (/web/report-requests, money in rupees).
 */
import { MOCK_ASTROLOGERS } from "./astrologers";

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export const MOCK_REPORT_REQUEST_SETTINGS = { enabled: true, allowAnyExpert: true };

/** Mock product id for a catalogue report (the real ids come from the dashboard's report products). */
export const mockProductId = (slug) => `rp_${slug}`;

/** A report product as GET /config sends it, from a catalogue entry of report.service. */
export const mockProduct = (r) => ({
  id: mockProductId(r.slug),
  slug: r.slug,
  title: r.title || null,
  shortDescription: r.shortDescription || null,
  description: r.description || null,
  image: null,
  icon: r.icon || null,
  price: r.price,
  originalPrice: r.originalPrice || null,
  deliveryHours: Math.max(24, r.deliveryHours || 0),
  profilesRequired: r.profilesRequired === 2 ? 2 : 1,
  includes: r.includes || [],
  sampleUrl: null,
  pages: r.pages || null,
});

/** An astrologer row as GET /astrologers sends it. */
export const mockAstroRow = (a) => ({
  id: a.id,
  slug: a.slug,
  name: a.name,
  avatar: a.avatarUrl || null,
  rating: a.rating || 0,
  ratingCount: a.reviewCount || 0,
  sessions: a.totalSessions || 0,
  experienceYears: a.experienceYears || 0,
  languages: a.languages || [],
  specialties: a.specialties || [],
  skills: [],
  isVerified: true,
});

export const mockReportAstroCard = (a) => (a ? { id: a.id, name: a.name, avatar: a.avatarUrl || null, slug: a.slug } : null);

const iso = (ms) => (ms ? new Date(ms).toISOString() : null);

const SAMPLE_TEXT = `Namaste Rahul,

Your Lagna is Leo and your Moon is in Taurus in the 10th house. This gives you a strong wish to be seen and respected for your work.

Career
Saturn is moving through your 7th house, so partnerships and contracts need patience this year. Job changes after April look better than before it.

Money
Jupiter supports savings from the second half of the year. Avoid lending large amounts before June.

Remedies
1. Offer water to the Sun every morning.
2. Chant "Om Namah Shivaya" 108 times on Mondays.

With blessings,
Acharya`;

/** Seed: one delivered (unread, with a PDF), one waiting with the astrologer, one with the team, one expired. */
export const MOCK_REPORT_REQUESTS = () => {
  const now = Date.now();
  const [a1, a2, a3] = [MOCK_ASTROLOGERS[0], MOCK_ASTROLOGERS[3], MOCK_ASTROLOGERS[6]];
  const base = { language: "en", declineReason: null, refund: null, rating: null, review: null, unread: false, openedAt: null, report: null, deliveredAt: null };
  return [
    {
      ...base,
      id: "rr_seed_1",
      code: "RR500001",
      status: "delivered",
      product: { id: mockProductId("kundli-report"), title: "Complete Kundli Report", slug: "kundli-report" },
      astrologer: mockReportAstroCard(a1),
      chosenBy: "user",
      forNames: ["Rahul Verma"],
      question: "Please focus on my career for the next two years.",
      price: 499,
      createdAt: iso(now - 4 * DAY),
      dueAt: iso(now - 4 * DAY + 72 * HOUR),
      deliveredAt: iso(now - 1 * DAY),
      report: { text: SAMPLE_TEXT, hasPdf: true, pdfName: "kundli-report-rahul.pdf" },
      unread: true,
      openedAt: iso(now - 3 * DAY),
    },
    {
      ...base,
      id: "rr_seed_2",
      code: "RR500002",
      status: "pending",
      product: { id: mockProductId("career-report"), title: "Career & Finance Report", slug: "career-report" },
      astrologer: mockReportAstroCard(a2),
      chosenBy: "user",
      forNames: ["Rahul Verma"],
      question: null,
      price: 399,
      createdAt: iso(now - 3 * HOUR),
      dueAt: iso(now - 3 * HOUR + 48 * HOUR),
    },
    {
      ...base,
      id: "rr_seed_3",
      code: "RR500003",
      status: "unassigned",
      product: { id: mockProductId("marriage-matching-report"), title: "Marriage Matching Report", slug: "marriage-matching-report" },
      astrologer: null,
      chosenBy: "team",
      forNames: ["Rahul Verma", "Priya Singh"],
      question: "Is this a good match? Our families want the wedding next year.",
      price: 699,
      createdAt: iso(now - 30 * 60_000),
      dueAt: iso(now - 30 * 60_000 + 72 * HOUR),
    },
    {
      ...base,
      id: "rr_seed_4",
      code: "RR500004",
      status: "expired",
      product: { id: mockProductId("yearly-prediction-2027"), title: "Yearly Prediction 2027", slug: "yearly-prediction-2027" },
      astrologer: mockReportAstroCard(a3),
      chosenBy: "user",
      forNames: ["Sunita Verma"],
      question: null,
      price: 599,
      createdAt: iso(now - 10 * DAY),
      dueAt: iso(now - 7 * DAY),
      refund: { amount: 599, at: iso(now - 7 * DAY), by: "system" },
    },
  ];
};
