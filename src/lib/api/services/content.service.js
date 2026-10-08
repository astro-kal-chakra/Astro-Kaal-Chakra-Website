import { env, siteConfig } from "@/config/site";
import { CATEGORIES, LANGUAGES, SPECIALTIES } from "@/constants/astrologer";
import { LEGAL_PAGES } from "@/features/legal/content";
import { MOCK_ASTROLOGERS, MOCK_REVIEWS } from "../mock/astrologers";
import { http, mockDelay } from "../http";
import { BLOG_CATEGORIES, BLOG_COVERS, MOCK_POSTS } from "../mock/blog";
import { FAQ_CATEGORIES, MOCK_ASTROLOGER_TESTIMONIALS, MOCK_FAQS } from "../mock/content";

/** Minimal public author info — never contact details. */
const toAuthor = (slug) => {
  const a = MOCK_ASTROLOGERS.find((x) => x.slug === slug);
  return a ? { id: a.id, slug: a.slug, name: a.name, avatarUrl: a.avatarUrl, specialties: a.specialties, experienceYears: a.experienceYears } : null;
};

/** Flatten an en/hi mock post into the shape the CMS should return for one locale. */
const localize = (post, locale) => {
  const { en, hi, authorSlug, ...rest } = post;
  const copy = (locale === "hi" ? hi : en) || en;
  return { ...rest, updatedAt: rest.updatedAt || rest.publishedAt, cover: BLOG_COVERS[rest.category], ...copy, author: toAuthor(authorSlug) };
};

const byDateDesc = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);

function filterPosts({ category, q }) {
  let list = [...MOCK_POSTS].sort(byDateDesc);
  if (category) list = list.filter((p) => p.category === category);
  if (q) {
    const needle = q.trim().toLowerCase();
    list = list.filter((p) =>
      [p.en.title, p.en.excerpt, p.hi.title, p.hi.excerpt, p.category].some((s) => s.toLowerCase().includes(needle))
    );
  }
  return list;
}

export const contentService = {
  categories: BLOG_CATEGORIES,
  faqCategories: FAQ_CATEGORIES,

  /** @returns {Promise<{ items: object[], total: number, page: number, pageSize: number, totalPages: number }>} */
  async listPosts({ category, q, page = 1, pageSize = 6, locale = "en", excludeSlug } = {}) {
    if (env.useMocks) {
      const all = filterPosts({ category, q }).filter((p) => p.slug !== excludeSlug);
      const items = all.slice((page - 1) * pageSize, page * pageSize).map((p) => localize(p, locale));
      return mockDelay({ items, total: all.length, page, pageSize, totalPages: Math.max(1, Math.ceil(all.length / pageSize)) }, 80);
    }
    return http("/blog/posts", { query: { category, q, page, pageSize, locale, exclude: excludeSlug }, next: { revalidate: 300 } });
  },

  async getFeaturedPost(locale = "en") {
    if (env.useMocks) {
      const post = MOCK_POSTS.find((p) => p.featured) || [...MOCK_POSTS].sort(byDateDesc)[0];
      return localize(post, locale);
    }
    return http("/blog/posts/featured", { query: { locale }, next: { revalidate: 300 } });
  },

  async getPost(slug, locale = "en") {
    if (env.useMocks) {
      const post = MOCK_POSTS.find((p) => p.slug === slug);
      return post ? localize(post, locale) : null;
    }
    return http(`/blog/posts/${slug}`, { query: { locale }, next: { revalidate: 300 } }).catch((e) => {
      if (e.status === 404) return null;
      throw e;
    });
  },

  async getRelatedPosts(post, { limit = 3, locale = "en" } = {}) {
    if (env.useMocks) {
      const score = (p) => (p.category === post.category ? 2 : 0) + p.signs.filter((s) => post.signs.includes(s)).length;
      return MOCK_POSTS.filter((p) => p.slug !== post.slug)
        .sort((a, b) => score(b) - score(a) || byDateDesc(a, b))
        .slice(0, limit)
        .map((p) => localize(p, locale));
    }
    return http(`/blog/posts/${post.slug}/related`, { query: { limit, locale }, next: { revalidate: 300 } });
  },

  async listPostSlugs() {
    if (env.useMocks) return MOCK_POSTS.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt || p.publishedAt }));
    return http("/blog/slugs", { next: { revalidate: 3600 } });
  },

  /** @returns {Promise<Record<string, {q: string, a: string}[]>>} keyed by FAQ category */
  async getFaqs(locale = "en") {
    if (env.useMocks) return MOCK_FAQS[locale] || MOCK_FAQS.en;
    return http("/content/faqs", { query: { locale }, next: { revalidate: 3600 } });
  },

  async getAstrologerTestimonials(locale = "en") {
    if (env.useMocks) return MOCK_ASTROLOGER_TESTIMONIALS[locale] || MOCK_ASTROLOGER_TESTIMONIALS.en;
    return http("/content/astrologer-testimonials", { query: { locale }, next: { revalidate: 3600 } });
  },

  /** @param {{ name: string, contact: string, topic: string, message: string }} payload */
  async submitContact(payload) {
    if (env.useMocks) return mockDelay({ ticketId: `CT-${Date.now().toString(36).toUpperCase()}`, ...payload }, 700);
    return http("/support/contact", { method: "POST", body: payload });
  },

  /**
   * Astrologer application. Documents are only previewed client-side for now —
   * TODO(api): upload files to a pre-signed URL first and send the resulting keys here.
   */
  async submitAstrologerApplication(payload) {
    if (env.useMocks) return mockDelay({ applicationId: `APP-${Date.now().toString(36).toUpperCase()}` }, 900);
    return http("/astrologer-applications", { method: "POST", body: payload });
  },

  /* ----------------------- Site-wide data (backend settings) ----------------------- */

  /**
   * Support contacts, app links, free-chat rules, recharge limits (rupees) — set in the admin dashboard.
   * @returns {Promise<{ support: object, appLinks: object, freeChat: { enabled: boolean, minutes: number, modes: string[] }, minWalletBalance: number, recharge: object, referral: object }>}
   */
  async getSiteConfig() {
    if (env.useMocks) return MOCK_SITE_CONFIG;
    return http("/config", { next: { revalidate: 300 } }).catch(() => MOCK_SITE_CONFIG);
  },

  /** Filter / form options: languages astrologers speak, specialties, categories. */
  async getMeta() {
    if (env.useMocks) return { languages: LANGUAGES, specialties: SPECIALTIES, categories: CATEGORIES.map((c) => c.slug) };
    return http("/meta", { next: { revalidate: 3600 } });
  },

  /** Latest 4–5★ written reviews from completed sessions (home / about). */
  async getRecentReviews(limit = 4) {
    if (env.useMocks) return MOCK_REVIEWS.slice(0, limit);
    return http("/reviews/recent", { query: { limit }, next: { revalidate: 600 } });
  },

  /** Legal / info page managed in the dashboard → { slug, title, sections: [[heading, text]], updatedAt } or null. */
  async getPage(slug) {
    if (env.useMocks) {
      const p = LEGAL_PAGES[slug];
      return p ? { slug, title: p.title, sections: p.sections, updatedAt: null } : null;
    }
    return http(`/pages/${slug}`, { next: { revalidate: 600 } }).catch((e) => {
      if (e.status === 404) return null;
      throw e;
    });
  },
};

/** Mock-mode defaults (also used if the config call fails, so the layout never breaks). */
const MOCK_SITE_CONFIG = {
  support: { email: siteConfig.supportEmail, phone: null, whatsapp: null },
  appLinks: { playStore: siteConfig.appLinks.playStore, appStore: siteConfig.appLinks.appStore },
  freeChat: { enabled: true, minutes: 3, modes: ["chat"] },
  minWalletBalance: 50,
  recharge: { minAmount: 50, maxAmount: 100000 },
  referral: { enabled: true, referrerReward: 50, refereeReward: 30, trigger: "first_recharge", minRecharge: 100, expiryDays: 30 },
};
