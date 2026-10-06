import { CalendarClock, CheckCircle2, ClipboardList, FileSearch, Home, Rocket, ShieldCheck, Star, Users, Wallet, Video } from "lucide-react";
import { routes } from "@/config/routes";
import { contentService } from "@/lib/api/services/content.service";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContentHero } from "@/features/content/components/ContentHero";
import { StepCards } from "@/features/content/components/StepCards";
import { ApplicationForm } from "@/features/content/become/ApplicationForm";
import { label as t } from "@/lib/labels";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({
    locale: lang,
    path: routes.becomeAstrologer,
    title: "Become an Astrologer – Join Our Verified Network",
    description: "Consult from home by chat, call or video, set your own hours and keep the full session amount until payout. Apply to join our network of verified astrologers.",
  });
}

const BENEFITS = [Home, CalendarClock, Wallet, Users, Star, ShieldCheck];
const PROCESS = [ClipboardList, FileSearch, Video, Rocket];

export default async function BecomeAstrologerPage({ params }) {
  const { lang } = await params;
  const meta = await contentService.getMeta().catch(() => null); // specialty / language options
  const testimonials = await contentService.getAstrologerTestimonials(lang);

  return (
    <>
      <ContentHero eyebrow="For astrologers" title="Share your wisdom. Grow your practice." subtitle="Join a network of verified astrologers consulting with clients across India — from home, on your own schedule.">
        <div className="flex flex-wrap gap-3">
          <a href="#apply" className={buttonClasses({ variant: "gold", size: "lg" })}>
            Apply now
          </a>
          <a href="#process" className={buttonClasses({ size: "lg", variant: "soft" })}>
            See how it works
          </a>
        </div>
        <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-col-reverse rounded-2xl border border-line bg-surface p-3 sm:p-4">
              <dt className="mt-1 text-xs text-muted sm:text-sm">{t(`content.become.heroStat${n}`)}</dt>
              <dd className="font-display text-lg text-accent sm:text-2xl">{t(`content.become.heroStat${n}Value`)}</dd>
            </div>
          ))}
        </dl>
      </ContentHero>

      <section className="container-page py-14">
        <SectionHeading title="Why astrologers join us" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((Icon, i) => (
            <Card as="li" key={i} className="flex gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-gold-300">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{t(`content.become.benefits.b${i + 1}Title`)}</h3>
                <p className="mt-0.5 text-sm text-muted">{t(`content.become.benefits.b${i + 1}Text`)}</p>
              </div>
            </Card>
          ))}
        </ul>
      </section>

      <section className="bg-surface-muted py-14">
        <div className="container-page grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">What you can earn</h2>
            <p className="mt-1 text-muted">Illustrative month at ₹30/min, 26 days, consulting for about half of your online time.</p>
            <Card className="mt-5 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-600 text-white dark:bg-brand-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Hours online / day</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Session earnings</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Paid to your bank*</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[1, 2, 3].map((n) => (
                    <tr key={n}>
                      <th scope="row" className="px-4 py-3 font-medium">{t(`content.become.earningsRow${n}`)}</th>
                      <td className="px-4 py-3 font-semibold text-brand-700 dark:text-gold-300">{t(`content.become.earningsRow${n}Value`)}</td>
                      <td className="px-4 py-3 font-semibold">{t(`content.become.earningsRow${n}Net`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <p className="mt-3 text-xs text-muted">
              *The full amount of every session is credited to your earnings. When you request a payout, a platform charge (30% by default) and 1% TDS are deducted, and the rest is sent to your bank. Actual earnings depend on your rates, ratings, availability and demand. You set your per-minute rates for chat, call and video within platform guidelines.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Requirements</h2>
            <ul className="mt-5 space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n} className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm">
                  <CheckCircle2 className="size-5 shrink-0 text-online" aria-hidden />
                  {t(`content.become.requirements.r${n}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="process" className="container-page scroll-mt-20 py-14">
        <SectionHeading title="How to join" />
        <StepCards
          steps={PROCESS.map((icon, i) => ({
            icon,
            title: t(`content.become.process.p${i + 1}Title`),
            text: t(`content.become.process.p${i + 1}Text`),
          }))}
        />
      </section>

      <section className="container-page pb-14">
        <SectionHeading title="Hear from our astrologers" />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {testimonials.map((tm) => (
            <Card as="li" key={tm.id} className="flex flex-col p-5">
              <RatingStars value={tm.rating} />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed">“{tm.text}”</blockquote>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={tm.name} size={40} />
                <div>
                  <p className="text-sm font-semibold">{tm.name}</p>
                  <p className="text-xs text-muted">{`With us since ${tm.since}`}</p>
                </div>
              </div>
            </Card>
          ))}
        </ul>
      </section>

      <section id="apply" className="bg-cosmic scroll-mt-16 py-14">
        <div className="container-page max-w-3xl">
          <div className="mb-6 text-center text-white">
            <h2 className="font-display text-3xl font-semibold text-white">Application form</h2>
            <p className="mt-2 text-white/95">It takes about 5 minutes. Your details are kept confidential.</p>
          </div>
          <Card className="p-5 sm:p-8">
            <ApplicationForm options={meta} />
          </Card>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Become an astrologer", path: `${routes.becomeAstrologer}` },
        ])}
      />
    </>
  );
}
