import { notFound } from "next/navigation";
import { Briefcase, Hash, Heart, HeartPulse, IndianRupee, Palette } from "lucide-react";
import { routes } from "@/config/routes";
import { HOROSCOPE_PERIODS, ZODIAC_SIGNS, getSign, isValidPeriod } from "@/constants/zodiac";
import { locales } from "@/config/locale";
import { horoscopeService } from "@/lib/api/services/horoscope.service";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { label as t } from "@/lib/labels";
import { formatDate } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/Card";
import { HoroscopeCta } from "@/features/horoscope/components/HoroscopeCta";
import { PeriodTabs } from "@/features/horoscope/components/PeriodTabs";
import { ZodiacGrid } from "@/features/horoscope/components/ZodiacGrid";

// Regenerate hourly so the daily horoscope rolls over without a redeploy.
export const revalidate = 3600;
export const dynamicParams = false;

/** 4 periods × 12 signs per locale — the main SEO surface. */
export function generateStaticParams() {
  return HOROSCOPE_PERIODS.flatMap((period) => ZODIAC_SIGNS.map((s) => ({ period, sign: s.slug })));
}

async function load(params) {
  const { lang, period, sign } = await params;
  const signInfo = getSign(sign);
  if (!signInfo || !isValidPeriod(period) || !locales.includes(lang)) notFound();
  return { lang, period, sign, signInfo };
}

export async function generateMetadata({ params }) {
  const { lang, period, sign, signInfo } = await load(params);
  const vars = { sign: signInfo[lang], period: t(`horoscope.${period}`), date: formatDate(new Date(), lang) };
  return buildMetadata({
    locale: lang,
    path: routes.horoscopeSign(period, sign),
    title: t("meta.signTitle", vars),
    description: t("meta.signDescription", vars),
    type: "article",
  });
}

export default async function SignHoroscopePage({ params }) {
  const { lang, period, sign, signInfo } = await load(params);
  const h = await horoscopeService.get({ sign, period, locale: lang });
  const title = `${signInfo[lang]} ${t(`horoscope.${period}`)} ${"Horoscope"}`;

  const sections = [
    { key: "love", icon: Heart },
    { key: "career", icon: Briefcase },
    { key: "money", icon: IndianRupee },
    { key: "health", icon: HeartPulse },
  ];

  return (
    <div className="container-page grid grid-cols-1 gap-8 py-8 lg:grid-cols-[1fr_320px]">
      <article className="space-y-6">
        <header className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-4xl text-gold-300" aria-hidden>
            {signInfo.symbol}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
            <p className="text-sm text-muted">
              {signInfo.dates} · {formatDate(new Date(), lang)}
            </p>
          </div>
        </header>

        <PeriodTabs sign={sign} active={period} />

        <p className="text-lg leading-relaxed">{h.summary}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sections.map(({ key, icon: Icon }) => (
            <Card key={key} className="p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Icon className="size-4 text-gold-500" aria-hidden /> {t(`horoscope.${key}`)}
              </h2>
              <p className="mt-1 text-sm text-muted">{h.sections[key]}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5">
            <Hash className="size-4 text-brand-500" aria-hidden /> Lucky number: <strong>{h.luckyNumber}</strong>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5">
            <Palette className="size-4 text-brand-500" aria-hidden /> Lucky colour: <strong>{h.luckyColor}</strong>
          </span>
        </div>

        <HoroscopeCta />
      </article>

      <aside>
        <h2 className="mb-3 font-semibold">Other signs</h2>
        <ZodiacGrid locale={lang} period={period} activeSign={sign} className="grid-cols-3 sm:grid-cols-4 lg:grid-cols-3" />
      </aside>

      <JsonLd
        data={[
          articleJsonLd({ title, description: h.summary, path: `${routes.horoscopeSign(period, sign)}`, datePublished: new Date().toISOString() }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Horoscope", path: `${routes.horoscope}` },
            { name: title, path: `${routes.horoscopeSign(period, sign)}` },
          ]),
        ]}
      />
    </div>
  );
}
