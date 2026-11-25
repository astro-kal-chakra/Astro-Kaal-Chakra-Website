import { routes } from "@/config/routes";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

const linkClass = "font-semibold text-accent underline-offset-4 hover:underline";

/** Topics people consult about: each links to the matching astrologers / tool with a descriptive anchor. */
const TOPICS = [
  {
    title: "Love and relationships",
    text: "Compatibility, misunderstandings, a breakup or a new relationship. An astrologer reads the 5th and 7th houses and Venus in your birth chart.",
  },
  {
    title: "Marriage and kundli matching",
    text: "Delays in marriage, Mangal Dosh, and Ashtakoot guna milan for a proposed match. Many families start with a free kundli matching report.",
    link: { href: routes.kundliMatching, label: "Free kundli matching for marriage" },
  },
  {
    title: "Career, job and business",
    text: "Job change, government exams, promotion, starting a business or working abroad, judged from the 10th house, Saturn and your current dasha.",
  },
  {
    title: "Money and finance",
    text: "Debt, investments and the right time for a big purchase, read from the 2nd and 11th houses and Jupiter's transit.",
  },
  {
    title: "Health and family",
    text: "Stress, recurring health worries and family harmony, with simple Vedic remedies such as mantras, fasting and charity.",
  },
  {
    title: "Doshas and remedies",
    text: "Kaal Sarp Dosh, Sade Sati, Pitra Dosh and the effects of Rahu and Ketu, with remedies that fit your chart and your budget.",
  },
];

/**
 * Homepage explainer (~550 words): what an online astrology consultation is, how it works and what
 * people ask about, with descriptive internal links to the tools, horoscopes and blog.
 */
export function HomeGuide() {
  return (
    <section className="container-page py-6 sm:py-8" aria-labelledby="home-guide-title">
      <SectionHeading
        eyebrow="Online astrology consultation"
        title={<span id="home-guide-title">Talk to an astrologer online, the Vedic way</span>}
        subtitle="Everything you need to know before your first consultation on Astro Kaal Chakra."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
        <article className="space-y-5 text-[1.02rem] leading-relaxed text-fg">
          <h3 className="font-display text-xl">What is an online astrology consultation?</h3>
          <p>
            An online astrology consultation is a one-to-one session with a Vedic astrologer over chat, phone call or video. The astrologer uses your date,
            time and place of birth to cast your birth chart (kundli), then reads the planets, houses and your running Vimshottari dasha to answer the
            question on your mind. It is the same guidance you would get from a family jyotishi, without travelling or waiting for an appointment.
          </p>
          <p>
            On Astro Kaal Chakra, every astrologer is verified before they go live. You can see each astrologer&apos;s experience, languages, specialties,
            ratings and per-minute rate before you start, and you pay only for the minutes you use.
          </p>

          <h3 className="font-display text-xl">How it works</h3>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>Choose an astrologer.</strong> Browse <LocaleLink href={routes.astrologers} className={linkClass}>verified Vedic astrologers</LocaleLink>{" "}
              and filter by language, specialty, rating and price.
            </li>
            <li>
              <strong>Share your birth details.</strong> Enter them once; they are saved for every future session. Don&apos;t know your chart yet? Make your{" "}
              <LocaleLink href={routes.kundli} className={linkClass}>free kundli online</LocaleLink> first.
            </li>
            <li>
              <strong>Chat, call or video.</strong> The per-minute rate is charged from your wallet, and you can end the session whenever you like.
            </li>
            <li>
              <strong>Keep your guidance.</strong> The chat transcript and any remedies the astrologer suggests stay in your account.
            </li>
          </ol>

          <h3 className="font-display text-xl">Free astrology tools to start with</h3>
          <p>
            Not ready to talk yet? Read your <LocaleLink href={routes.horoscope} className={linkClass}>daily horoscope for all 12 zodiac signs</LocaleLink>,
            check today&apos;s <LocaleLink href={routes.panchang} className={linkClass}>Panchang with tithi, nakshatra and Rahu Kaal</LocaleLink>, find your{" "}
            <LocaleLink href={routes.zodiacFinder} className={linkClass}>zodiac sign by date of birth</LocaleLink> or calculate your{" "}
            <LocaleLink href={routes.numerology} className={linkClass}>life path number in numerology</LocaleLink>. For a detailed written reading, see our{" "}
            <LocaleLink href={routes.reports} className={linkClass}>personalised astrology reports</LocaleLink>.
          </p>
          <p>
            Want to learn more first? Our <LocaleLink href={routes.blog} className={linkClass}>astrology blog</LocaleLink> explains doshas, transits, gemstones
            and remedies in plain language, and <LocaleLink href={routes.howItWorks} className={linkClass}>how Astro Kaal Chakra works</LocaleLink> covers
            pricing, privacy and refunds.
          </p>
        </article>

        <aside aria-labelledby="home-topics-title">
          <h3 id="home-topics-title" className="font-display text-xl text-fg">
            What you can ask an astrologer
          </h3>
          <ul className="mt-4 space-y-4">
            {TOPICS.map((t) => (
              <li key={t.title} className="rounded-2xl border border-line bg-surface p-4">
                <h4 className="font-semibold text-fg">{t.title}</h4>
                <p className="mt-1 text-sm text-muted">{t.text}</p>
                {t.link && (
                  <LocaleLink href={t.link.href} className={`mt-2 inline-block text-sm ${linkClass}`}>
                    {t.link.label} →
                  </LocaleLink>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

/** Shown (and marked up as FAQPage) when the dashboard has no FAQs published yet. */
export const DEFAULT_HOME_FAQS = [
  {
    q: "How do I talk to an astrologer online?",
    a: "Pick a verified astrologer, recharge your wallet and start a chat, call or video session. You see the per-minute rate before you start and can end the session at any time.",
  },
  {
    q: "Are the astrologers on Astro Kaal Chakra verified?",
    a: "Yes. Every astrologer completes identity verification and an interview before going live, and only users who finished a paid session can rate them.",
  },
  {
    q: "What details do I need for a consultation?",
    a: "Your date of birth, exact time of birth and place of birth. The astrologer uses them to cast your kundli. If you don't know your birth time, tell the astrologer; some questions can still be answered.",
  },
  {
    q: "Is my consultation private?",
    a: "Yes. Your phone number and contact details are never shared with the astrologer, and your chat history is visible only in your account.",
  },
  {
    q: "Can I get a free kundli?",
    a: "Yes. The free kundli tool gives your Lagna chart, planet positions and Vimshottari dasha without login. Kundli matching and Panchang are free too.",
  },
];
