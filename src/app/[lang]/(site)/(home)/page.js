import { routes } from "@/config/routes";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { contentService } from "@/lib/api/services/content.service";
import { liveService } from "@/lib/api/services/live.service";
import { SORT_OPTIONS } from "@/constants/astrologer";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { isoDateIn } from "@/features/tools/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Categories } from "@/features/home/components/Categories";
import { Hero } from "@/features/home/components/Hero";
import { HomeAstrologers } from "@/features/home/components/HomeAstrologers";
import { DEFAULT_HOME_FAQS, HomeGuide } from "@/features/home/components/HomeGuide";
import { LiveNowSection } from "@/features/home/components/LiveNowSection";
import { AppBand, FaqSection, FreeTools, HowItWorks, OffersBanner, Reviews, TrustSection } from "@/features/home/components/InfoSections";
import { ZodiacGrid } from "@/features/horoscope/components/ZodiacGrid";

// Live data (who is live / online, today's panchang): re-render at most every 30 s; online status then updates live over the socket
export const revalidate = 30;

const DELHI = { name: "New Delhi", region: "Delhi, India", lat: 28.61, lng: 77.21, timezone: "Asia/Kolkata" };

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ locale: lang, path: "/", title: { absolute: "Astro Kaal Chakra – Talk to Online Astrologers | Chat & Call" }, description: "Talk to verified Vedic astrologers online on Astro Kaal Chakra. Chat, call or video for love, marriage, career and health. Free kundli and daily horoscope." });
}

/**
 * Home FAQs: the first questions of the "consultations" and "payments" groups managed in the dashboard,
 * or the built-in ones while the dashboard has none (the FAQ section and FAQPage markup always show).
 */
const homeFaqs = (byCategory = {}) => {
  const fromDashboard = [...(byCategory.consultations || []).slice(0, 3), ...(byCategory.payments || []).slice(0, 2)];
  return fromDashboard.length ? fromDashboard : DEFAULT_HOME_FAQS;
};

/**
 * Reviews worth showing: one per user, no near-empty one-word reviews ("Accurate"), no repeated text.
 * Repeated or one-word reviews look fake to visitors and to Google.
 */
function distinctReviews(reviews = [], limit = 4) {
  const users = new Set();
  const texts = new Set();
  const out = [];
  for (const r of reviews) {
    const text = String(r.text || "").trim();
    const user = String(r.user || "").trim().toLowerCase();
    const key = text.toLowerCase();
    if (text.split(/\s+/).length < 5 || users.has(user) || texts.has(key)) continue;
    users.add(user);
    texts.add(key);
    out.push(r);
    if (out.length === limit) break;
  }
  return out;
}

/**
 * Most credible first: astrologers with reviews, then the higher rating, more consultations and more experience.
 * Brand-new profiles (no sessions yet) go last so the homepage leads with proven astrologers.
 */
const byCredibility = (a, b) =>
  Number(b.reviewCount > 0) - Number(a.reviewCount > 0) ||
  Number((b.totalSessions || 0) > 0) - Number((a.totalSessions || 0) > 0) ||
  (b.rating || 0) - (a.rating || 0) ||
  (b.totalSessions || 0) - (a.totalSessions || 0) ||
  (b.experienceYears || 0) - (a.experienceYears || 0);

export default async function HomePage({ params }) {
  const { lang } = await params;
  const [onlineRes, topRes, liveRes, config, meta, reviews, faqGroups, panchang] = await Promise.all([
    astrologerService.list({ online: "1" }, { pageSize: 6 }),
    // A larger pool so the "Our astrologers" row can skip anyone already shown under "Online now"
    astrologerService.list({ sort: SORT_OPTIONS.EXP_HIGH }, { pageSize: 18 }),
    liveService.list(lang, { revalidate: 15 }).catch(() => ({ live: [] })),
    contentService.getSiteConfig(),
    contentService.getMeta().catch(() => null),
    contentService.getRecentReviews(20).catch(() => []),
    contentService.getFaqs(lang).catch(() => ({})),
    astroToolsService.getPanchang({ date: isoDateIn(new Date()), place: DELHI }).catch(() => null),
  ]);
  const faqs = homeFaqs(faqGroups);
  const homeReviews = distinctReviews(reviews);
  const topAstrologers = [...topRes.items].sort(byCredibility);

  return (
    <>
      <Hero panchang={panchang} freeChat={config.freeChat} />

      {/* Live broadcasts only while someone is streaming (the section updates itself); "online now" only when someone is online; all astrologers always */}
      <LiveNowSection sessions={liveRes.live ?? []} />
      <Reveal>
        <HomeAstrologers online={onlineRes.items} all={topAstrologers} />
      </Reveal>

      <Reveal>
        <Categories categories={meta?.categories} />
      </Reveal>

      <Reveal>
        <section className="container-page py-4 sm:py-6">
          <SectionHeading eyebrow="Today" title="Your horoscope for today" action={{ href: routes.horoscope, label: "Daily horoscope for all 12 signs" }} />
          <ZodiacGrid locale={lang} variant="strip" />
        </section>
      </Reveal>

      <Reveal>
        <FreeTools />
      </Reveal>
      <Reveal>
        <OffersBanner freeChat={config.freeChat} minRecharge={config.recharge?.minAmount} />
      </Reveal>
      <Reveal>
        <HowItWorks freeChat={config.freeChat} />
      </Reveal>
      {homeReviews.length > 0 && (
        <Reveal>
          <Reviews locale={lang} reviews={homeReviews} />
        </Reveal>
      )}
      <Reveal>
        <TrustSection />
      </Reveal>
      <HomeGuide />
      {faqs.length > 0 && (
        <Reveal>
          <FaqSection faqs={faqs} />
        </Reveal>
      )}
      <Reveal>
        <AppBand appLinks={config.appLinks} />
      </Reveal>
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
    </>
  );
}
