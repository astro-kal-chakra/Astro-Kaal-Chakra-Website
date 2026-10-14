/**
 * Global site configuration. Brand name is a placeholder — change it here
 * and it updates everywhere (header, footer, metadata, JSON-LD).
 */
/** The live domain. Canonical URLs, robots.txt, sitemap, Open Graph and JSON-LD all point here. */
const PRODUCTION_URL = "https://www.astrokaalchakra.com";

/**
 * NEXT_PUBLIC_SITE_URL overrides it (e.g. for a staging domain); production builds
 * default to the live domain, local dev to localhost.
 */
const isProd = process.env.NODE_ENV === "production";
const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
// A localhost value copied from .env.example must never reach the live site's canonical URLs / sitemap.
const usableEnvUrl = envUrl && !( isProd && /localhost|127\.0\.0\.1/.test( envUrl ) ) ? envUrl : "";
// Local dev follows whatever port the server actually started on (3000, 3001, …).
const devUrl = typeof window !== "undefined" ? window.location.origin : `http://localhost:${process.env.PORT || 3000}`;
const siteUrl = ( usableEnvUrl || ( isProd ? PRODUCTION_URL : devUrl ) ).replace( /\/$/, "" );

export const siteConfig = {
  name: "Astro Kaal Chakra",
  tagline: "Talk to verified astrologers, anytime",
  description:
    "Chat, call or video with verified Vedic astrologers for love, career, marriage, finance and health. First 3-minute chat free. Daily horoscope, free Kundli, Kundli matching and Panchang.",
  keywords: [
    "Astro Kaal Chakra",
    "Astro Kaal Chakra astrology",
    "online astrologer",
    "talk to astrologer",
    "astrology consultation",
    "free kundli",
    "kundli matching",
    "daily horoscope",
    "Panchang",
    "Vedic astrology",
    "numerology",
    "Jyotish",
  ],
  url: siteUrl,
  supportEmail: "support@astrokaalchakra.com",
  /** Floating "Chat with us" button: fallback when the dashboard has no Support → WhatsApp set. */
  whatsappChatUrl: "https://chat.whatsapp.com/CvXNqmm4JeZAL3yDzdm9I6",
  appLinks: {
    playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#",
    appStore: process.env.NEXT_PUBLIC_APP_STORE_URL || "#",
  },
  /** Brand logo (header, footer, Google). Generated from brand/logo-source.png. */
  logo: "/images/logo.png",
  ogImage: "/images/og-default.png",
  /** Official social profiles — Google links them to the brand (Organization `sameAs`). */
  socialLinks: [
    "https://www.instagram.com/astro_kaal_chakra",
    // Facebook page (canonical og:url of the share link facebook.com/share/19vPBQUKqy)
    "https://www.facebook.com/people/Astro-Kaal-Chakra/pfbid02JJwnkfrdA9AkzogrqYjgg3C4THYag79hiFdH4QKmYu9H2nwBVW9jbh5PbhVkynvHl/",
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
