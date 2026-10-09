import { BadgeCheck, CalendarDays, Hash, Heart, Lock, MessageCircle, ScrollText, Search, Sparkles, Star, Sun, UserCheck } from "lucide-react";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/utils/format";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChakraGlyph } from "@/components/ui/ChakraDial";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AppStoreButtons } from "@/components/layout/AppStoreButtons";

export function HowItWorks({ freeChat }) {
  const free = freeChat?.enabled ? `Your first chat is free for ${freeChat.minutes} minutes. After that you` : "You";
  const steps = [
    { icon: Search, title: "Choose an astrologer", text: "Filter by language, specialty, rating and price. See who is online right now." },
    { icon: MessageCircle, title: "Chat, call or video", text: `${free} pay the astrologer's per-minute rate from your wallet.` },
    { icon: Sparkles, title: "Get guidance", text: "Share birth details once, save the chat, rate the session and come back anytime." },
  ];
  return (
    <section className="container-page py-4 sm:py-6">
      <SectionHeading eyebrow="Simple" title="How it works" align="center" />
      <ol className="reveal-stagger relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-5">
        {/* Thread joining the three steps */}
        <span className="hairline absolute inset-x-[16%] top-8 hidden md:block" aria-hidden />
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex flex-col items-center text-center">
            <span className="relative flex size-16 items-center justify-center rounded-full border border-brand-200 bg-surface text-brand-600 dark:border-brand-800 dark:text-brand-300">
              <s.icon className="size-6" aria-hidden />
              <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-4 text-lg font-semibold text-fg">{s.title}</h3>
            <p className="mt-1 max-w-xs text-sm text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TrustSection() {
  const items = [
    { icon: UserCheck, title: "Verified and trained", text: "Every astrologer passes KYC, an interview and our training before going live." },
    { icon: Lock, title: "Private by design", text: "Phone numbers and contact details are never shared on either side." },
    { icon: Star, title: "Honest ratings", text: "Only users who completed a paid session can leave a review." },
    { icon: BadgeCheck, title: "Clear pricing", text: "Per-minute rates shown upfront, with a receipt for every recharge and session." },
  ];
  return (
    <section className="container-page py-4 sm:py-6">
      <SectionHeading eyebrow="Trust" title="Why people choose us" />
      <ul className="reveal-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <Card as="li" key={it.title} className="p-5">
            <it.icon className="size-6 text-brand-600 dark:text-brand-300" aria-hidden />
            <h3 className="mt-3 font-semibold text-fg">{it.title}</h3>
            <p className="mt-1 text-sm text-muted">{it.text}</p>
          </Card>
        ))}
      </ul>
    </section>
  );
}

/** Saffron band: the free first chat (backend settings; hidden when free chats are off). */
export function OffersBanner({ freeChat, minRecharge = 50 }) {
  if (!freeChat?.enabled) return null;
  return (
    <section className="container-page py-4 sm:py-6">
      <div className="bg-cosmic shine relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl p-7 text-white sm:flex-row sm:items-center sm:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">New here?</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">{`Your first ${freeChat.minutes}-minute chat is free`}</h2>
          <p className="mt-2 max-w-xl text-white/90">{`One free chat per account. After that, recharge from ₹${minRecharge} and pay the astrologer's per-minute rate.`}</p>
        </div>
        <ButtonLink href={routes.astrologers} size="lg" variant="light" className="relative z-10 motion-safe:animate-glow">
          Start free chat
        </ButtonLink>
      </div>
    </section>
  );
}

export function FreeTools() {
  const tools = [
    { icon: ScrollText, title: "Free Kundli", text: "Birth chart, dasha and planets", href: routes.kundli },
    { icon: Heart, title: "Kundli Matching", text: "36-guna milan for marriage", href: routes.kundliMatching },
    { icon: CalendarDays, title: "Panchang", text: "Tithi, nakshatra, Rahu Kaal", href: routes.panchang },
    { icon: Sun, title: "Horoscope", text: "Daily, weekly, monthly", href: routes.horoscope },
    { icon: Hash, title: "Numerology", text: "Your life path number", href: routes.numerology },
    { icon: Sparkles, title: "Zodiac Finder", text: "Find your sun and moon sign", href: routes.zodiacFinder },
  ];
  return (
    <section className="container-page py-4 sm:py-6">
      <SectionHeading eyebrow="Free tools" title="Start with your own chart" subtitle="Free, no login needed. Save them to your account any time." />
      <ul className="reveal-stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tools.map((tool) => (
          <li key={tool.title}>
            <LocaleLink href={tool.href} className="group block h-full">
              <Card interactive className="flex h-full flex-col gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950/50 dark:text-brand-300">
                  <tool.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-fg">{tool.title}</span>
                  <span className="block text-xs text-muted">{tool.text}</span>
                </span>
              </Card>
            </LocaleLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Reviews({ locale, reviews }) {
  return (
    <section className="border-y border-line bg-surface-muted/60 py-8 sm:py-10">
      <div className="container-page">
        <SectionHeading eyebrow="Reviews" title="What our users say" subtitle="From users who completed a session." />
        <ul className="reveal-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} locale={locale} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ReviewCard({ review: r, locale, as = "li" }) {
  return (
    <Card as={as} className="flex flex-col p-5">
      <RatingStars value={r.rating} />
      <p className="mt-3 flex-1 font-display text-[1.05rem] leading-relaxed text-fg">“{r.text}”</p>
      <p className="mt-4 text-sm font-semibold text-fg">{r.user}</p>
      <p className="text-xs text-muted">{formatDate(r.date, locale)}</p>
    </Card>
  );
}

export function FaqSection({ faqs }) {
  return (
    <section className="container-page grid grid-cols-1 gap-6 py-4 sm:py-6 lg:grid-cols-[1fr_2fr] lg:gap-10">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions, answered"
        subtitle="Billing, privacy, refunds and more."
        action={{ href: routes.faqs, label: "All FAQs" }}
        className="flex-col items-start"
      />
      <Accordion items={faqs} />
    </section>
  );
}

/** Closing band: the app. */
export function AppBand({ appLinks }) {
  return (
    <section className="container-page pb-8 pt-4 sm:pt-6">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-muted/70 p-7 sm:p-10">
        <ChakraGlyph className="pointer-events-none absolute -right-10 -top-10 size-56 text-brand-200 dark:text-brand-900" />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl text-fg">Your astrologer, in your pocket</h2>
            <p className="mt-2 max-w-lg text-muted">Same account and wallet on the app and the website. Get a notification the moment your astrologer accepts.</p>
          </div>
          <AppStoreButtons tone="light" links={appLinks} />
        </div>
      </div>
    </section>
  );
}
