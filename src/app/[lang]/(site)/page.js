import { routes } from "@/config/routes";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { contentService } from "@/lib/api/services/content.service";
import { liveService } from "@/lib/api/services/live.service";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { isoDateIn } from "@/features/tools/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Categories } from "@/features/home/components/Categories";
import { Hero } from "@/features/home/components/Hero";
import { HomeAstrologers } from "@/features/home/components/HomeAstrologers";
import { HomeLiveNow } from "@/features/home/components/HomeLiveNow";
import { AppBand, FaqSection, FreeTools, HowItWorks, OffersBanner, Reviews, TrustSection } from "@/features/home/components/InfoSections";
import { ZodiacGrid } from "@/features/horoscope/components/ZodiacGrid";

// Live data (who is live / online, today's panchang): re-render at most every 30 s; online status then updates live over the socket
export const revalidate = 30;

const DELHI = { name: "New Delhi", region: "Delhi, India", lat: 28.61, lng: 77.21, timezone: "Asia/Kolkata" };

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: "/", title: { absolute: "Talk to Verified Astrologers Online – Chat, Call & Video" }, description: "Chat, call or video with verified Vedic astrologers for love, career, marriage, finance and health. Free first chat. Daily horoscope, free Kundli and Panchang." });
}

/** Home FAQs: the first questions of the "consultations" and "payments" groups managed in the dashboard. */
const homeFaqs = (byCategory = {}) => [...(byCategory.consultations || []).slice(0, 3), ...(byCategory.payments || []).slice(0, 2)];

export default async function HomePage({ params }) {
  const { lang } = await params;
  const [onlineRes, topRes, liveRes, config, meta, reviews, faqGroups, panchang] = await Promise.all([
    astrologerService.list({ online: "1" }, { pageSize: 6 }),
    astrologerService.list({}, { pageSize: 6 }),
    liveService.list(lang).catch(() => ({ live: [] })),
    contentService.getSiteConfig(),
    contentService.getMeta().catch(() => null),
    contentService.getRecentReviews(4).catch(() => []),
    contentService.getFaqs(lang).catch(() => ({})),
    astroToolsService.getPanchang({ date: isoDateIn(new Date()), place: DELHI }).catch(() => null),
  ]);
  // Nobody online right now: show the top astrologers instead of an empty row
  const faqs = homeFaqs(faqGroups);

  return (
    <>
      <Hero panchang={panchang} freeChat={config.freeChat} />

      {/* Live broadcasts and "online now" only when there are some; all astrologers always */}
      <HomeLiveNow sessions={liveRes.live} />
      <HomeAstrologers online={onlineRes.items} all={topRes.items} />

      <Categories categories={meta?.categories} />

      <section className="container-page py-4 sm:py-6">
        <SectionHeading eyebrow="Today" title="Your horoscope for today" action={{ href: routes.horoscope, label: "All horoscopes" }} />
        <ZodiacGrid locale={lang} variant="strip" />
      </section>

      <FreeTools />
      <OffersBanner freeChat={config.freeChat} minRecharge={config.recharge?.minAmount} />
      <HowItWorks freeChat={config.freeChat} />
      {reviews.length > 0 && <Reviews locale={lang} reviews={reviews} />}
      <TrustSection />
      {faqs.length > 0 && <FaqSection faqs={faqs} />}
      <AppBand appLinks={config.appLinks} />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
    </>
  );
}
