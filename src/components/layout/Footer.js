import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { ZODIAC_SIGNS } from "@/constants/zodiac";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { AppStoreButtons } from "./AppStoreButtons";
import { Logo } from "./Logo";


export function Footer({ locale, config }) {
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
    <footer className="mt-16 border-t border-line bg-surface-muted/70">
      <div className="hairline" aria-hidden />
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{siteConfig.tagline}. Chat, call or video.</p>
          <AppStoreButtons label="Download the app" tone="light" links={config?.appLinks} />
          {config?.support?.email && (
            <p className="text-sm text-muted">
              Support:{" "}
              <a href={`mailto:${config.support.email}`} className="text-accent hover:underline">
                {config.support.email}
              </a>
            </p>
          )}
        </div>
        {columns.map((col) => (
          <div key={col.title} className="min-w-0">
            <h3 className="eyebrow mb-4">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map(([href, label]) => (
                <li key={href}>
                  <LocaleLink href={href} className="text-muted transition-colors hover:text-accent">
                    {label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Internal links to every daily horoscope page — helps crawl depth. */}
      <div className="container-page border-t border-line py-6">
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          {ZODIAC_SIGNS.map((s) => (
            <li key={s.slug}>
              <LocaleLink href={routes.horoscopeSign("daily", s.slug)} className="hover:text-accent">
                {s[locale]} Daily
              </LocaleLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>Astrology offers guidance, not guarantees. Consultations may be reviewed for safety and quality.</p>
        <p>
          © {new Date().getFullYear()} <span translate="no" className="notranslate">{siteConfig.name}</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
