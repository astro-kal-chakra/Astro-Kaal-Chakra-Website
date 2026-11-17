import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { HOROSCOPE_PERIODS, ZODIAC_SIGNS } from "@/constants/zodiac";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { contentService } from "@/lib/api/services/content.service";
import { reportService } from "@/lib/api/services/report.service";
import { LEGAL_PAGES } from "@/features/legal/content";

// Built on each request so new astrologers and blog posts appear right away. (With `revalidate`, Vercel kept
// serving the copy from the last deploy.) The slug lists are still cached for up to an hour in their fetch calls.
export const dynamic = "force-dynamic";

/** Today in India (YYYY-MM-DD): daily horoscopes change every day. */
const todayIST = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const STATIC_PATHS = [
  routes.home, routes.astrologers, routes.horoscope, routes.kundli, routes.kundliMatching,
  routes.panchang, routes.zodiacFinder, routes.numerology, routes.blog, routes.about, routes.howItWorks,
  routes.contact, routes.faqs, routes.becomeAstrologer, routes.reports, routes.live,
];

/**
 * One sitemap entry (as an array so callers can flatMap).
 * lastModified is only set when we know the real date: Google ignores <lastmod> on sites where it is
 * always "now", which would also discard the real dates of astrologer profiles and blog posts.
 */
function entry(path, { changeFrequency = "weekly", priority = 0.5, lastModified } = {}) {
  return [{ url: `${siteConfig.url}${path === "/" ? "" : path}`, lastModified, changeFrequency, priority }];
}

export default async function sitemap() {
  const [astrologers, posts, reports] = await Promise.all([
    // a failed request leaves that group out instead of breaking the whole sitemap
    astrologerService.listSlugs().catch(() => []),
    contentService.listPostSlugs().catch(() => []),
    reportService.listSlugs().catch(() => []),
  ]);

  return [
    ...STATIC_PATHS.flatMap((p) => entry(p, { priority: p === "/" ? 1 : 0.7 })),
    ...HOROSCOPE_PERIODS.flatMap((period) =>
      ZODIAC_SIGNS.flatMap((s) =>
        entry(routes.horoscopeSign(period, s.slug), {
          changeFrequency: period === "daily" ? "daily" : "weekly",
          priority: 0.8,
          ...(period === "daily" ? { lastModified: todayIST() } : {}),
        })
      )
    ),
    ...astrologers.flatMap((a) => entry(routes.astrologer(a.slug), { changeFrequency: "daily", priority: 0.8, lastModified: a.updatedAt })),
    ...posts.flatMap((p) => entry(routes.blogPost(p.slug), { priority: 0.6, lastModified: p.updatedAt })),
    ...reports.flatMap((slug) => entry(routes.report(slug), { priority: 0.6 })),
    ...Object.keys(LEGAL_PAGES).flatMap((slug) => entry(routes.legal(slug), { changeFrequency: "yearly", priority: 0.2 })),
  ];
}
