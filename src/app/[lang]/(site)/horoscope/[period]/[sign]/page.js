import { notFound } from "next/navigation";
import { BookOpen, Briefcase, Hash, Heart, HeartPulse, Home, IndianRupee, Palette, Plane, Sparkles } from "lucide-react";
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

// Re-render every 5 minutes: dashboard edits and the daily roll-over show up without a redeploy.
export const revalidate = 300;

/** Icon for a section by its title (sections are written in the dashboard; any title works). */
const SECTION_ICONS = [
  [/love|relationship|romance|marriage/i, Heart],
  [/career|work|job|business/i, Briefcase],
  [/money|finance|wealth/i, IndianRupee],
  [/health|wellness|wellbeing/i, HeartPulse],
  [/family|home/i, Home],
  [/travel/i, Plane],
  [/education|study|exam/i, BookOpen],
];
const iconFor = (title) => SECTION_ICONS.find(([re]) => re.test(title))?.[1] || Sparkles;
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

  // Dashboard sections in their order; older responses only have the classic four
  const sections = h.sectionList ?? ["love", "career", "money", "health"].map((key) => ({ title: t(`horoscope.${key}`), text: h.sections?.[key] }));

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
              {signInfo.dates} · {h.label || formatDate(new Date(), lang)}
            </p>
          </div>
        </header>

        <PeriodTabs sign={sign} active={period} />

        <p className="text-lg leading-relaxed">{h.summary}</p>

        {sections.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sections.map(({ title: heading, text }, i) => {
              const Icon = iconFor(heading);
              return (
                <Card key={`${i}-${heading}`} className={sections.length % 2 === 1 && i === sections.length - 1 ? "p-4 sm:col-span-2" : "p-4"}>
                  <h2 className="flex items-center gap-2 font-semibold">
                    <Icon className="size-4 text-gold-500" aria-hidden /> {heading}
                  </h2>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted">{text}</p>
                </Card>
              );
            })}
          </div>
        )}

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
