import { BadgeCheck, ClipboardCheck, FileCheck2, Heart, IndianRupee, Lock, ShieldCheck, Star, Video } from "lucide-react";
import { routes } from "@/config/routes";
import { MOCK_REVIEWS } from "@/lib/api/mock/astrologers";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContentCta } from "@/features/content/components/ContentCta";
import { ContentHero } from "@/features/content/components/ContentHero";
import { StepCards } from "@/features/content/components/StepCards";
import { WhyChooseUs } from "@/features/content/components/WhyChooseUs";
import { Reviews, TrustSection } from "@/features/home/components/InfoSections";
import { label as t } from "@/lib/labels";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: routes.about, title: "About Us – Verified Astrologers, Honest Guidance", description: "Learn who we are, how we verify every astrologer and why millions trust us for private astrology consultations." });
}

const STATS = ["astrologers", "consultations", "rating", "languages"];
const VALUES = [
  { n: 1, icon: Heart },
  { n: 2, icon: Lock },
  { n: 3, icon: IndianRupee },
  { n: 4, icon: Star },
];
const VERIFY_ICONS = [FileCheck2, ClipboardCheck, Video, ShieldCheck];

export default async function AboutPage({ params }) {
  const { lang } = await params;

  return (
    <>
      <ContentHero eyebrow="About us" title="Honest astrology, made accessible" subtitle="We connect people with verified astrologers for private, practical guidance — anytime, in their own language.">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={routes.astrologers} variant="gold" size="lg">
            Talk to an astrologer
          </ButtonLink>
          <ButtonLink href={routes.howItWorks} size="lg" className="border border-white/30 bg-white/10 text-white hover:bg-white/20">
            How it works
          </ButtonLink>
        </div>
      </ContentHero>

      <section className="container-page -mt-8 relative">
        <Card as="dl" className="grid grid-cols-2 gap-px overflow-hidden bg-line p-0 md:grid-cols-4">
          {STATS.map((k) => (
            <div key={k} className="flex flex-col-reverse bg-surface p-5 text-center">
              <dt className="mt-1 text-sm text-muted">{t(`content.about.stats.${k}`)}</dt>
              <dd className="font-display text-2xl font-bold text-brand-600 dark:text-gold-400 sm:text-3xl">{t(`content.about.stats.${k}Value`)}</dd>
            </div>
          ))}
        </Card>
      </section>

      <section className="container-page grid grid-cols-1 gap-8 py-14 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Our mission</h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">To make trustworthy astrological guidance available to everyone, without fear-selling, hidden charges or compromises on privacy.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Our story</h2>
          <p className="mt-3 leading-relaxed text-muted">We started with a simple frustration: finding a genuine astrologer was hard, and many consultations relied on fear rather than insight.</p>
          <p className="mt-3 leading-relaxed text-muted">So we built a platform where every astrologer is interviewed and verified, every review comes from a real session, and every rupee is billed transparently by the minute.</p>
        </div>
      </section>

      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <SectionHeading title="What we stand for" />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ n, icon: Icon }) => (
              <Card as="li" key={n} className="p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-gold-300">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{t(`content.about.values.v${n}Title`)}</h3>
                <p className="mt-1 text-sm text-muted">{t(`content.about.values.v${n}Text`)}</p>
              </Card>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeading
          title={
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="size-7 text-gold-500" aria-hidden /> How we verify astrologers
            </span>
          }
        />
        <StepCards
          steps={[1, 2, 3, 4].map((n) => ({
            icon: VERIFY_ICONS[n - 1],
            title: t(`content.about.verifySteps.s${n}Title`),
            text: t(`content.about.verifySteps.s${n}Text`),
          }))}
        />
      </section>

      <WhyChooseUs />
      <TrustSection />
      <Reviews locale={lang} reviews={MOCK_REVIEWS} />

      <div className="container-page pb-14">
        <ContentCta title="Ready for clarity?" text="Talk to a verified astrologer now — your first chat is free." cta="Talk to an astrologer" />
      </div>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About us", path: `${routes.about}` },
        ])}
      />
    </>
  );
}
