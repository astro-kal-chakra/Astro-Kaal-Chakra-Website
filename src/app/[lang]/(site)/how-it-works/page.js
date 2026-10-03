import { Gift, Hourglass, MessageCircle, Video, Wallet } from "lucide-react";
import { routes } from "@/config/routes";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { ContentCta } from "@/features/content/components/ContentCta";
import { ContentHero } from "@/features/content/components/ContentHero";
import { StepCards } from "@/features/content/components/StepCards";
import { WhyChooseUs } from "@/features/content/components/WhyChooseUs";
import { FaqSection } from "@/features/home/components/InfoSections";
import { FAQS } from "@/features/home/faqs";
import { label as t } from "@/lib/labels";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: routes.howItWorks, title: "How It Works – Chat, Video Call, Wallet & Free First Chat", description: "Step-by-step guide to consulting an astrologer: choose an expert, recharge your wallet, start a chat or video call, use your free first chat or join the waitlist." });
}

/** Each guide: anchor id, dictionary group, icon, step count, primary link. */
const GUIDES = [
  { id: "chat", key: "chat", icon: MessageCircle, steps: 4, href: routes.astrologers, cta: "common.chat" },
  { id: "video", key: "video", icon: Video, steps: 4, href: `${routes.astrologers}?mode=video`, cta: "common.videoCall" },
  { id: "wallet", key: "wallet", icon: Wallet, steps: 4, href: routes.wallet, cta: "wallet.recharge" },
  { id: "free-chat", key: "freeChat", icon: Gift, steps: 3, href: `${routes.astrologers}?online=1`, cta: "home.heroCta" },
  { id: "waitlist", key: "waitlist", icon: Hourglass, steps: 3, href: routes.astrologers, cta: "common.joinWaitlist" },
];

export default async function HowItWorksPage({ params }) {
  const { lang } = await params;
  const faqs = FAQS[lang];

  return (
    <>
      <ContentHero eyebrow="How it works" title="Your consultation, step by step" subtitle="Everything you need to know about chatting, video calls, your wallet, the free first chat and the waitlist.">
        <nav aria-label="Jump to">
          <ul className="flex flex-wrap gap-2">
            {GUIDES.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  <g.icon className="size-4 text-gold-300" aria-hidden /> {t(`content.how.${g.key}.nav`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </ContentHero>

      <div className="container-page divide-y divide-line">
        {GUIDES.map((g, i) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-20 py-12">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                <span
                  className={
                    i % 2
                      ? "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold-500 text-brand-950"
                      : "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-gold-300"
                  }
                >
                  <g.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h2 id={`${g.id}-title`} className="font-display text-2xl font-semibold sm:text-3xl">
                    {t(`content.how.${g.key}.title`)}
                  </h2>
                  <p className="mt-1 text-muted">{t(`content.how.${g.key}.intro`)}</p>
                </div>
              </div>
              <ButtonLink href={g.href} variant="outline" size="sm" className="self-start sm:self-auto">
                {t(g.cta)} →
              </ButtonLink>
            </div>
            <StepCards
              className={g.steps === 3 ? "lg:grid-cols-3" : undefined}
              label={(n) => `Step ${n}`}
              steps={Array.from({ length: g.steps }, (_, s) => ({
                title: t(`content.how.${g.key}.s${s + 1}Title`),
                text: t(`content.how.${g.key}.s${s + 1}Text`),
              }))}
            />
          </section>
        ))}
      </div>

      <WhyChooseUs />
      <FaqSection faqs={faqs} />

      <div className="container-page pb-14">
        <ContentCta title="Ready to start?" text="Find an astrologer online right now." cta="Talk to an Astrologer" />
      </div>

      <JsonLd
        data={[
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "How it works", path: `${routes.howItWorks}` },
          ]),
        ]}
      />
    </>
  );
}
