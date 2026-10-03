import { env } from "@/config/site";
import { ApiError, http, mockDelay } from "../http";
import { __mockWallet } from "./wallet.service";

/**
 * Paid astrology reports (PDF). Bought from the wallet balance; generated
 * asynchronously by the backend (status "generating" → "ready" | "failed").
 *
 * Report copy (title / description / included items) is localised in
 * dictionaries/<lang>/wallet.json under wallet.reports.catalog.<slug> and
 * wallet.reports.item.<key>. TODO(api): switch to localised copy from the API if the CMS owns it.
 */

const CATALOG = [
  {
    slug: "kundli-report",
    icon: "scroll",
    price: 499,
    originalPrice: 999,
    pages: 45,
    deliveryHours: 2,
    profilesRequired: 1,
    rating: 4.8,
    sold: 12800,
    includes: ["birthChart", "planetPositions", "dasha", "doshas", "career", "health", "remedies"],
  },
  {
    slug: "marriage-matching-report",
    icon: "heart",
    price: 699,
    originalPrice: 1299,
    pages: 30,
    deliveryHours: 2,
    profilesRequired: 2,
    rating: 4.7,
    sold: 8400,
    includes: ["gunaMilan", "manglik", "compatibility", "marriageTiming", "coupleRemedies"],
  },
  {
    slug: "yearly-prediction-2027",
    icon: "calendar",
    price: 599,
    originalPrice: 1199,
    pages: 35,
    deliveryHours: 4,
    profilesRequired: 1,
    rating: 4.6,
    sold: 6100,
    includes: ["monthByMonth", "transits", "careerFinance", "loveFamily", "healthYear", "luckyDates"],
  },
  {
    slug: "career-report",
    icon: "briefcase",
    price: 399,
    originalPrice: 799,
    pages: 25,
    deliveryHours: 2,
    profilesRequired: 1,
    rating: 4.7,
    sold: 5300,
    includes: ["careerPath", "jobVsBusiness", "wealth", "favourablePeriods", "remedies"],
  },
];

// --- Mock store ------------------------------------------------------------
const REPORTS_KEY = "mock_reports";
const DAY = 24 * 3600_000;
/** Mock generation time so you can watch "generating" flip to "ready". */
const MOCK_GENERATION_MS = 20_000;

const MOCK_PROFILES = [
  { id: "bp_self", name: "Rahul Verma", relation: "self", dob: "1994-08-14", tob: "06:45", place: "Lucknow, Uttar Pradesh" },
  { id: "bp_partner", name: "Priya Singh", relation: "partner", dob: "1996-02-02", tob: "21:10", place: "Jaipur, Rajasthan" },
  { id: "bp_mother", name: "Sunita Verma", relation: "parent", dob: "1968-11-23", tob: "11:30", place: "Kanpur, Uttar Pradesh" },
];

function readReports() {
  if (typeof window === "undefined") return { items: [], idem: {} };
  try {
    const s = JSON.parse(localStorage.getItem(REPORTS_KEY));
    if (s) return s;
  } catch {}
  return {
    idem: {},
    items: [
      {
        id: "rep_seed_1",
        slug: "kundli-report",
        profileNames: ["Rahul Verma"],
        price: 499,
        purchasedAt: Date.now() - 12 * DAY,
        readyAt: Date.now() - 12 * DAY + 3600_000,
      },
    ],
  };
}

const writeReports = (s) => {
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(s));
  } catch {}
};

const withStatus = (r) => ({
  ...r,
  icon: CATALOG.find((c) => c.slug === r.slug)?.icon,
  status: Date.now() >= r.readyAt ? "ready" : "generating",
});

// ---------------------------------------------------------------------------

export const reportService = {
  async list() {
    if (env.useMocks) return CATALOG;
    return http("/reports", { next: { revalidate: 3600 } });
  },

  async getBySlug(slug) {
    if (env.useMocks) return CATALOG.find((r) => r.slug === slug) || null;
    return http(`/reports/${slug}`, { next: { revalidate: 3600 } }).catch((e) => {
      if (e.status === 404) return null;
      throw e;
    });
  },

  async listSlugs() {
    if (env.useMocks) return CATALOG.map((r) => r.slug);
    return http("/reports/slugs", { next: { revalidate: 3600 } });
  },

  /**
   * Saved birth profiles to generate the report for.
   * TODO(api): owned by the account area (birth profiles) — swap to that service when it lands.
   */
  async getBirthProfiles() {
    if (env.useMocks) return mockDelay(MOCK_PROFILES, 250);
    return http("/me/birth-profiles", { cache: "no-store" });
  },

  /**
   * Buy a report from the wallet balance. Throws ApiError code INSUFFICIENT_BALANCE (402).
   * @returns {{ reportId: string, balance: number }}
   */
  async purchase({ slug, profileIds, idempotencyKey }) {
    if (env.useMocks) {
      await mockDelay(null, 600);
      const store = readReports();
      if (store.idem[idempotencyKey]) return { reportId: store.idem[idempotencyKey], balance: __mockWallet.read().balance };
      const report = CATALOG.find((r) => r.slug === slug);
      if (!report) throw new ApiError("Report not found", { status: 404 });
      if (profileIds.length !== report.profilesRequired) throw new ApiError("Select profiles", { status: 400, code: "PROFILES_REQUIRED" });
      const balance = __mockWallet.debit({ amount: report.price, meta: { slug } });
      const id = `rep_${Date.now().toString(36)}`;
      const names = profileIds.map((pid) => MOCK_PROFILES.find((p) => p.id === pid)?.name).filter(Boolean);
      store.items.push({
        id,
        slug,
        profileNames: names,
        price: report.price,
        purchasedAt: Date.now(),
        readyAt: Date.now() + MOCK_GENERATION_MS,
      });
      store.idem[idempotencyKey] = id;
      writeReports(store);
      return { reportId: id, balance };
    }
    return http(`/reports/${slug}/purchase`, {
      method: "POST",
      body: { profileIds },
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  /** @returns {Promise<object[]>} purchased reports, newest first, with status "generating" | "ready" | "failed". */
  async getMyReports() {
    if (env.useMocks) {
      const items = readReports()
        .items.map(withStatus)
        .sort((a, b) => b.purchasedAt - a.purchasedAt);
      return mockDelay(items, 300);
    }
    return http("/me/reports", { cache: "no-store" });
  },

  /** Short-lived signed URL to the PDF. */
  async getDownloadUrl(reportId) {
    if (env.useMocks) {
      await mockDelay(null, 300);
      const r = readReports().items.find((x) => x.id === reportId);
      if (!r) throw new ApiError("Not found", { status: 404 });
      // Mock "PDF": a tiny text file so the download flow can be exercised end to end.
      const text = `Mock report\n\nReport: ${r.slug}\nFor: ${r.profileNames.join(" & ")}\nGenerated: ${new Date(r.readyAt).toISOString()}\n\nThe real PDF is served by the backend via a signed URL.`;
      return { url: URL.createObjectURL(new Blob([text], { type: "text/plain" })), filename: `${r.slug}-${r.id}.txt`, revoke: true };
    }
    return http(`/me/reports/${reportId}/download`, { cache: "no-store" });
  },
};
