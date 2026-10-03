import { siteConfig } from "@/config/site";

const PRIVATE = ["/login", "/onboarding", "/wallet", "/account", "/chat", "/call", "/consult", "/session"];

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", ...PRIVATE] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
