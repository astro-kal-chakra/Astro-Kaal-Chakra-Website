import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { ZODIAC_SIGNS } from "@/constants/zodiac";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { AppStoreButtons } from "./AppStoreButtons";
import { Logo } from "./Logo";

export function Footer({ locale }) {
  const columns = [
    {
      title: "Company",
      links: [
        [routes.about, "About us"],
        [routes.howItWorks, "How it works"],
        [routes.becomeAstrologer, "Become an astrologer"],
        [routes.blog, "Blog"],
        [routes.live, "Live Now"],
        [routes.contact, "Contact us"],
        [routes.faqs, "FAQs"],
      ],
    },
    {
      title: "Free tools",
      links: [
        [routes.kundli, "Free Kundli"],
        [routes.kundliMatching, "Kundli Matching"],
        [routes.panchang, "Panchang"],
        [routes.horoscope, "Horoscope"],
        [routes.zodiacFinder, "Zodiac Sign Finder"],
        [routes.numerology, "Numerology"],
        [routes.reports, "Reports"],
      ],
    },
    {
      title: "Legal",
      links: [
        [routes.legal("privacy-policy"), "Privacy Policy"],
        [routes.legal("terms"), "Terms of Use"],
        [routes.legal("refund-policy"), "Refund & Cancellation"],
        [routes.legal("disclaimer"), "Disclaimer"],
      ],
    },
  ];

  return (
    <footer className="mt-16 bg-gradient-to-b from-brand-500 to-brand-600 text-white">
      <div className="container-page grid grid-cols-1 gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo onDark />
          <p className="max-w-xs text-sm text-white/90">{siteConfig.tagline}</p>
          <AppStoreButtons label="Download the app" />
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">{col.title}</h3>
            <ul className="space-y-2 text-sm">
              {col.links.map(([href, label]) => (
                <li key={href}>
                  <LocaleLink href={href} className="text-white/90 hover:text-white">
                    {label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Internal links to every daily horoscope page — helps crawl depth. */}
      <div className="container-page border-t border-white/25 py-6">
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/85">
          {ZODIAC_SIGNS.map((s) => (
            <li key={s.slug}>
              <LocaleLink href={routes.horoscopeSign("daily", s.slug)} className="hover:text-white">
                {s[locale]} Daily
              </LocaleLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page border-t border-white/25 py-6 text-xs text-white/85">
        <p>Astrology provides guidance, not guarantees. Consultations may be reviewed for safety and quality.</p>
        <p className="mt-2">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
