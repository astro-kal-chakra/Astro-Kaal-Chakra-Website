import { routes } from "@/config/routes";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AstrologerLiveRow } from "@/features/astrologers/components/AstrologerLiveRow";
import { Categories } from "@/features/home/components/Categories";
import { Hero } from "@/features/home/components/Hero";
import { AppBand, FaqSection, FreeTools, HowItWorks, OffersBanner, Reviews, TrustSection } from "@/features/home/components/InfoSections";
import { FAQS } from "@/features/home/faqs";
import { ZodiacGrid } from "@/features/horoscope/components/ZodiacGrid";
import { MOCK_REVIEWS } from "@/lib/api/mock/astrologers";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: "/", title: { absolute: "Talk to Verified Astrologers Online – Chat, Call & Video" }, description: "Chat, call or video with verified Vedic astrologers for love, career, marriage, finance and health. First 3-minute chat free. Daily horoscope, free Kundli and Panchang." });
}

export default async function HomePage({ params }) {
  const { lang } = await params;
  const { items: online } = await astrologerService.list({ online: "1" }, { pageSize: 6 });
  const faqs = FAQS[lang];

  return (
    <>
      <Hero />

      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Live now"
          title="Astrologers online now"
          subtitle="Start in seconds. Busy? Join the waitlist and we'll offer you the next slot."
          action={{ href: `${routes.astrologers}?online=1`, label: "View all" }}
        />
        <AstrologerLiveRow astrologers={online} />
      </section>

      <Categories />

      <section className="container-page pb-6">
        <SectionHeading eyebrow="Today" title="Your horoscope for today" action={{ href: routes.horoscope, label: "All horoscopes" }} />
        <ZodiacGrid locale={lang} variant="strip" />
      </section>

      <FreeTools />
      <OffersBanner />
      <HowItWorks />
      <Reviews locale={lang} reviews={MOCK_REVIEWS} />
      <TrustSection />
      <FaqSection faqs={faqs} />
      <AppBand />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
