/**
 * Single source of truth for app paths (without the locale prefix).
 * Use with <LocaleLink href={routes.astrologer(slug)} />.
 */
export const routes = {
  home: "/",
  astrologers: "/astrologers",
  astrologer: (slug) => `/astrologers/${slug}`,
  horoscope: "/horoscope",
  horoscopeSign: (period, sign) => `/horoscope/${period}/${sign}`,

  // Free tools
  kundli: "/kundli",
  kundliMatching: "/kundli-matching",
  panchang: "/panchang",
  zodiacFinder: "/zodiac-sign-finder",
  numerology: "/numerology",

  // Content & trust
  blog: "/blog",
  blogPost: (slug) => `/blog/${slug}`,
  about: "/about",
  howItWorks: "/how-it-works",
  contact: "/contact",
  faqs: "/faqs",
  becomeAstrologer: "/become-astrologer",
  legal: (slug) => `/legal/${slug}`,
  reports: "/reports",
  report: (slug) => `/reports/${slug}`,
  live: "/live",
  liveRoom: (id) => `/live/${id}`,

  // Auth
  login: "/login",
  onboarding: "/onboarding",

  // Logged-in
  wallet: "/wallet",
  walletTransactions: "/wallet/transactions",
  paymentStatus: (orderId) => `/wallet/payment/${orderId}`,
  account: "/account",
  profile: "/account/profile",
  sessions: "/account/sessions",
  following: "/account/following",
  birthProfiles: "/account/profiles",
  savedKundlis: "/account/kundlis",
  myReports: "/account/reports",
  referral: "/account/referral",
  notifications: "/account/notifications",
  notificationSettings: "/account/notifications/settings",
  support: "/account/support",
  supportTicket: (id) => `/account/support/${id}`,
  settings: "/account/settings",

  // Sessions (full-screen)
  consult: "/consult", // pre-session: ?astrologer=slug&mode=chat|video
  chat: (sessionId) => `/chat/${sessionId}`,
  call: (sessionId) => `/call/${sessionId}`,
  sessionSummary: (sessionId) => `/session/${sessionId}/summary`,
};

/** Paths that require login — matched by prefix in proxy.js. */
export const PROTECTED_PREFIXES = ["/wallet", "/account", "/chat", "/call", "/consult", "/session", "/onboarding"];

/** Paths a logged-in user should not see. */
export const GUEST_ONLY_PREFIXES = ["/login"];
