import { buildMetadata } from "@/lib/seo/metadata";
import { HoroscopeCta } from "@/features/horoscope/components/HoroscopeCta";
import { ZodiacGrid } from "@/features/horoscope/components/ZodiacGrid";
import { label as t } from "@/lib/labels";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: "/horoscope", title: "Horoscope Today – Daily, Weekly, Monthly & Yearly", description: "Read free daily, weekly, monthly and yearly horoscopes for all 12 zodiac signs." });
}

export default async function HoroscopeIndexPage({ params }) {
  const { lang } = await params;
  return (
    <div className="container-page space-y-10 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Horoscope Today – Daily, Weekly, Monthly &amp; Yearly</h1>
        <p className="mt-2 text-muted">Choose your sign</p>
      </header>
      {["daily", "weekly", "monthly", "yearly"].map((period) => (
        <section key={period}>
          <h2 className="mb-4 font-display text-2xl">{t(`horoscope.${period}`)}</h2>
          <ZodiacGrid locale={lang} period={period} variant="strip" />
        </section>
      ))}
      <HoroscopeCta />
    </div>
  );
}
