import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { ZODIAC_SIGNS } from "@/constants/zodiac";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ZodiacWheel } from "@/components/ui/CelestialBackdrop";
import { AppStoreButtons } from "./AppStoreButtons";
import { Logo } from "./Logo";


/** Twinkling sparkles over the footer: [left %, top %, size px, delay s]. */
const SPARKLES = [
  [6, 14, 12, 0],
  [31, 72, 9, 1.6],
  [47, 18, 11, 2.8],
  [63, 58, 13, 0.9],
  [79, 22, 10, 2.2],
  [93, 46, 12, 3.4],
];

export function Footer({ locale, config }) {
  const columns = [
    {
      title: "Company",
      links: [
        [routes.about, "About us"],
        [routes.howItWorks, "How it works"],
        [routes.becomeAstrologer, "Become an astrologer"],
        [routes.blog, "Astrology Blog"],
        [routes.live, "Live Sessions"],
        [routes.contact, "Contact us"],
        [routes.faqs, "FAQs"],
      ],
    },
    {
      title: "Free tools",
      links: [
        [routes.kundli, "Janam Kundli"],
        [routes.kundliMatching, "Kundli Milan (Guna Matching)"],
        [routes.panchang, "Today's Panchang"],
        [routes.horoscope, "Daily Horoscope"],
        [routes.zodiacFinder, "Zodiac Sign Finder"],
        [routes.numerology, "Numerology Calculator"],
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
    // Solid bg + the same 70% tint as a layer: looks identical, but page-level backgrounds (the fixed zodiac
    // wheel on horoscope/legal pages) can't show through and clash with the footer's own wheel.
    <footer className="relative isolate mt-16 overflow-hidden border-t border-line bg-bg">
      <div aria-hidden className="absolute inset-0 -z-20 bg-surface-muted/70" />
      <div className="hairline" aria-hidden />
      {/* Kaal Chakra animation (same wheel as the horoscope pages), faint behind the link columns */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* phones: beside the Legal column; desktop: bottom-right behind the link columns */}
        <div className="absolute -right-28 top-[48%] w-72 opacity-40 sm:w-96 md:top-auto md:-bottom-44 md:-right-16 md:w-[34rem] md:opacity-45 dark:opacity-30">
          <ZodiacWheel />
        </div>
        {SPARKLES.map(([left, top, size, delay], i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute text-gold-500 opacity-70 motion-safe:animate-twinkle dark:text-gold-300"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${delay}s` }}
          >
            <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" fill="currentColor" />
          </svg>
        ))}
      </div>
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 space-y-4 md:col-span-1">
          {/* Plain branding here; the header logo is the link home (avoids a duplicate link text) */}
          <Logo asLink={false} />
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
                  <LocaleLink href={href} className="inline-block text-muted transition duration-200 hover:text-accent motion-safe:hover:translate-x-1">
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
