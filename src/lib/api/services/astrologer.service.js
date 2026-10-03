import { env } from "@/config/site";
import { SORT_OPTIONS } from "@/constants/astrologer";
import { http, mockDelay } from "../http";
import { MOCK_ASTROLOGERS, MOCK_REVIEWS } from "../mock/astrologers";

const STATUS_RANK = { online: 0, busy: 1, offline: 2 };

function applyFilters(list, f = {}) {
  let out = [...list];
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((a) => a.name.toLowerCase().includes(q) || a.specialties.some((s) => s.toLowerCase().includes(q)));
  }
  if (f.language) out = out.filter((a) => a.languages.includes(f.language));
  if (f.specialty) out = out.filter((a) => a.specialties.includes(f.specialty));
  if (f.category) out = out.filter((a) => a.categories.includes(f.category));
  if (f.minRating) out = out.filter((a) => a.rating >= Number(f.minRating));
  if (f.minPrice != null) out = out.filter((a) => a.chatPrice >= Number(f.minPrice));
  if (f.maxPrice != null) out = out.filter((a) => a.chatPrice <= Number(f.maxPrice));
  if (f.online) out = out.filter((a) => a.status === "online");
  if (f.mode === "video") out = out.filter((a) => a.supportsVideo);

  const sorters = {
    [SORT_OPTIONS.RATING]: (a, b) => b.rating - a.rating,
    [SORT_OPTIONS.PRICE_LOW]: (a, b) => a.chatPrice - b.chatPrice,
    [SORT_OPTIONS.PRICE_HIGH]: (a, b) => b.chatPrice - a.chatPrice,
    [SORT_OPTIONS.POPULARITY]: (a, b) => b.popularity - a.popularity,
  };
  const sorter = sorters[f.sort] || sorters[SORT_OPTIONS.POPULARITY];
  // Online astrologers always float to the top, then the chosen sort.
  return out.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || sorter(a, b));
}

export const astrologerService = {
  /** @returns {Promise<{ items: object[], total: number, page: number, pageSize: number }>} */
  async list(filters = {}, { page = 1, pageSize = 12 } = {}) {
    if (env.useMocks) {
      const all = applyFilters(MOCK_ASTROLOGERS, filters);
      const items = all.slice((page - 1) * pageSize, page * pageSize);
      return mockDelay({ items, total: all.length, page, pageSize }, 150);
    }
    return http("/astrologers", { query: { ...filters, page, pageSize }, next: { revalidate: 30 } });
  },

  async getBySlug(slug) {
    if (env.useMocks) return MOCK_ASTROLOGERS.find((a) => a.slug === slug) || null;
    return http(`/astrologers/${slug}`, { next: { revalidate: 60 } }).catch((e) => {
      if (e.status === 404) return null;
      throw e;
    });
  },

  async getReviews(astrologerId, { page = 1 } = {}) {
    if (env.useMocks) return { items: MOCK_REVIEWS, total: MOCK_REVIEWS.length, page };
    return http(`/astrologers/${astrologerId}/reviews`, { query: { page }, next: { revalidate: 300 } });
  },

  async getSimilar(astrologer, limit = 4) {
    if (env.useMocks) {
      return MOCK_ASTROLOGERS.filter(
        (a) => a.id !== astrologer.id && a.specialties.some((s) => astrologer.specialties.includes(s))
      )
        .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
        .slice(0, limit);
    }
    return http(`/astrologers/${astrologer.id}/similar`, { query: { limit }, next: { revalidate: 60 } });
  },

  async listSlugs() {
    if (env.useMocks) return MOCK_ASTROLOGERS.map((a) => ({ slug: a.slug, updatedAt: new Date().toISOString() }));
    return http("/astrologers/slugs", { next: { revalidate: 3600 } });
  },

  async follow(astrologerId, follow = true) {
    if (env.useMocks) return mockDelay({ following: follow });
    return http(`/astrologers/${astrologerId}/follow`, { method: follow ? "POST" : "DELETE" });
  },
};
