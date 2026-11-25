import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { HoroscopeCta } from "@/features/horoscope/components/HoroscopeCta";
import { ZodiacGrid } from "@/features/horoscope/components/ZodiacGrid";
import { label as t } from "@/lib/labels";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: "/horoscope", title: "Horoscope Today – All 12 Zodiac Signs", description: "Read free daily, weekly, monthly and yearly horoscopes for all 12 zodiac signs. Don't know your sign? Check your horoscope by date of birth." });
}

export default async function HoroscopeIndexPage({ params }) {
  const { lang } = await params;
  return (
    <div className="container-page space-y-10 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Horoscope Today – Daily, Weekly, Monthly &amp; Yearly</h1>
        <p className="mt-2 text-muted">
          Choose your sign below. Don&apos;t know your sign?{" "}
          <LocaleLink href={`${routes.zodiacFinder}#find-your-sign`} className="font-semibold text-accent underline-offset-4 hover:underline">
            Find your zodiac sign by date of birth
          </LocaleLink>
          .
        </p>
      </header>
      {["daily", "weekly", "monthly", "yearly"].map((period) => (
        <section key={period}>
          <h2 className="mb-4 font-display text-2xl">{t(`horoscope.${period}`)}</h2>
          <ZodiacGrid locale={lang} period={period} variant="strip" />
        </section>
      ))}
      {/* Answers "how to know your horoscope" / "how to check my horoscope by date of birth" (Search Console queries) */}
      <section aria-labelledby="horoscope-how-title" className="max-w-3xl space-y-3 leading-relaxed text-fg">
        <h2 id="horoscope-how-title" className="font-display text-2xl">
          How to check your horoscope by date of birth
        </h2>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            Find your zodiac sign from your birthday with the{" "}
            <LocaleLink href={`${routes.zodiacFinder}#find-your-sign`} className="font-semibold text-accent underline-offset-4 hover:underline">
              zodiac sign finder
            </LocaleLink>
            .
          </li>
          <li>Pick your sign above and choose daily, weekly, monthly or yearly.</li>
          <li>Read the predictions for love, career, money and health.</li>
        </ol>
        <p>
          A sign horoscope is shared by everyone born under that sign. For a horoscope made from your own date, time and place of birth, create your{" "}
          <LocaleLink href={routes.kundli} className="font-semibold text-accent underline-offset-4 hover:underline">
            free kundli by date of birth
          </LocaleLink>
          , which also shows your rashi (moon sign), or{" "}
          <LocaleLink href={routes.astrologers} className="font-semibold text-accent underline-offset-4 hover:underline">
            talk to an astrologer
          </LocaleLink>
          .
        </p>
      </section>
      <HoroscopeCta />
    </div>
  );
}
