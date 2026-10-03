/**
 * Global site configuration. Brand name is a placeholder — change it here
 * and it updates everywhere (header, footer, metadata, JSON-LD).
 */
export const siteConfig = {
  name: "Astro-Kaal-Chakra",
  tagline: "Talk to verified astrologers, anytime",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supportEmail: "support@example.com",
  appLinks: {
    playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#",
    appStore: process.env.NEXT_PUBLIC_APP_STORE_URL || "#",
  },
  ogImage: "/images/og-default.png",
};

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "",
  /** When no API URL is configured the app runs on local mock data. */
  useMocks: !process.env.NEXT_PUBLIC_API_URL,
};

/** Non-sensitive cookie set on login so the proxy can do optimistic redirects. */
export const AUTH_HINT_COOKIE = "logged_in";
