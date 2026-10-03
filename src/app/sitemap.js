import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { HOROSCOPE_PERIODS, ZODIAC_SIGNS } from "@/constants/zodiac";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { contentService } from "@/lib/api/services/content.service";
import { reportService } from "@/lib/api/services/report.service";
import { LEGAL_PAGES } from "@/features/legal/content";

export const revalidate = 3600;

const STATIC_PATHS = [
  routes.home, routes.astrologers, routes.horoscope, routes.kundli, routes.kundliMatching,
  routes.panchang, routes.zodiacFinder, routes.numerology, routes.blog, routes.about, routes.howItWorks,
  routes.contact, routes.faqs, routes.becomeAstrologer, routes.reports, routes.live,
];

/** One sitemap entry (as an array so callers can flatMap). */
function entry(path, { changeFrequency = "weekly", priority = 0.5, lastModified = new Date() } = {}) {
  return [{ url: `${siteConfig.url}${path === "/" ? "" : path}`, lastModified, changeFrequency, priority }];
}

export default async function sitemap() {
  const [astrologers, posts, reports] = await Promise.all([
    astrologerService.listSlugs(),
    contentService.listPostSlugs(),
    reportService.listSlugs(),
  ]);

  return [
    ...STATIC_PATHS.flatMap((p) => entry(p, { priority: p === "/" ? 1 : 0.7 })),
    ...HOROSCOPE_PERIODS.flatMap((period) =>
      ZODIAC_SIGNS.flatMap((s) =>
        entry(routes.horoscopeSign(period, s.slug), { changeFrequency: period === "daily" ? "daily" : "weekly", priority: 0.8 })
      )
    ),
    ...astrologers.flatMap((a) => entry(routes.astrologer(a.slug), { changeFrequency: "daily", priority: 0.8, lastModified: a.updatedAt })),
    ...posts.flatMap((p) => entry(routes.blogPost(p.slug), { priority: 0.6, lastModified: p.updatedAt })),
    ...reports.flatMap((slug) => entry(routes.report(slug), { priority: 0.6 })),
    ...Object.keys(LEGAL_PAGES).flatMap((slug) => entry(routes.legal(slug), { changeFrequency: "yearly", priority: 0.2 })),
  ];
}
