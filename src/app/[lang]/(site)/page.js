import { routes } from "@/config/routes";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AstrologerLiveRow } from "@/features/astrologers/components/AstrologerLiveRow";
import { Categories } from "@/features/home/components/Categories";
import { Hero } from "@/features/home/components/Hero";
import { FaqSection, HowItWorks, OffersBanner, Reviews, TrustSection } from "@/features/home/components/InfoSections";
import { FAQS } from "@/features/home/faqs";
import { ZodiacGrid } from "@/features/horoscope/components/ZodiacGrid";
import { MOCK_REVIEWS } from "@/lib/api/mock/astrologers";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: "/", title: { absolute: "Talk to Verified Astrologers Online – Chat & Video Call" }, description: "Chat or video call with verified Vedic astrologers for love, career, marriage, finance and health. Free first chat. Daily horoscope, free Kundli and Panchang." });
}

export default async function HomePage({ params }) {
  const { lang } = await params;
  const { items: online } = await astrologerService.list({ online: "1" }, { pageSize: 8 });
  const faqs = FAQS[lang];

  return (
    <>
      <Hero />

      <section className="container-page py-12">
        <SectionHeading title="Astrologers online now" action={{ href: `${routes.astrologers}?online=1`, label: "View all" }} />
        <AstrologerLiveRow astrologers={online} />
      </section>

      <Categories />

      <section className="container-page py-12">
        <SectionHeading title="Today's horoscope" action={{ href: routes.horoscope, label: "View all" }} />
        <ZodiacGrid locale={lang} variant="strip" />
      </section>

      <OffersBanner />
      <HowItWorks />
      <TrustSection />
      <Reviews locale={lang} reviews={MOCK_REVIEWS} />
      <FaqSection faqs={faqs} />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
