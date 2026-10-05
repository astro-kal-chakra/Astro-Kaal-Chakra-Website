import { siteConfig } from "@/config/site";

const PRIVATE = ["/login", "/onboarding", "/wallet", "/account", "/chat", "/call", "/consult", "/session"];

/** Only the live production domain is crawlable; preview/dev deployments are blocked entirely. */
const isProduction = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";

export default function robots() {
  if (!isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/images/"],
        // `$` = exact match, so "/chat" doesn't also block a future "/chat-with-astrologer" page.
        // Sorted listings duplicate the default listing, so they're kept out of the crawl budget.
        disallow: ["/api/", ...PRIVATE.flatMap((p) => [`${p}$`, `${p}/`, `${p}?`]), "/*?*sort="],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
