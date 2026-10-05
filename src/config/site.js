/**
 * Global site configuration. Brand name is a placeholder — change it here
 * and it updates everywhere (header, footer, metadata, JSON-LD).
 */
/**
 * Public domain used in canonical URLs, robots.txt, sitemap and Open Graph.
 * Set NEXT_PUBLIC_SITE_URL to the live domain (e.g. https://www.example.com);
 * on Vercel it falls back to the project's production domain.
 */
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const siteConfig = {
  name: "Astro-Kaal-Chakra",
  tagline: "Talk to verified astrologers, anytime",
  description:
    "Chat, call or video with verified Vedic astrologers for love, career, marriage, finance and health. First 3-minute chat free. Daily horoscope, free Kundli, Kundli matching and Panchang.",
  keywords: [
    "talk to astrologer", "online astrologer", "astrology consultation", "free kundli", "kundli matching",
    "guna milan", "daily horoscope", "panchang", "vedic astrology", "numerology", "jyotish",
  ],
  url: siteUrl,
  supportEmail: "support@example.com",
  appLinks: {
    playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#",
    appStore: process.env.NEXT_PUBLIC_APP_STORE_URL || "#",
  },
  /** Brand logo for Google (square, ≥112px). Generated from LogoMark. */
  logo: "/images/logo.png",
  ogImage: "/images/og-default.png",
  /** Official social profiles — Google links them to the brand (Organization `sameAs`). */
  socialLinks: [
    // "https://www.instagram.com/your-handle",
    // "https://www.facebook.com/your-page",
    // "https://www.youtube.com/@your-channel",
  ],
  /** Search Console / Bing Webmaster verification codes (the `content` value of their meta tag). */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
  },
};

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "",
  /** When no API URL is configured the app runs on local mock data. */
  useMocks: !process.env.NEXT_PUBLIC_API_URL,
};

/** Non-sensitive cookie set on login so the proxy can do optimistic redirects. */
export const AUTH_HINT_COOKIE = "logged_in";
