import { BadgeCheck, Lock, MessageCircle, Search, Sparkles, Star } from "lucide-react";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/utils/format";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HowItWorks() {
  const steps = [
    { icon: Search, title: "Choose an astrologer", text: "Filter by language, specialty, price and rating." },
    { icon: MessageCircle, title: "Start a chat or call", text: "Pay per minute from your wallet. First chat is free." },
    { icon: Sparkles, title: "Get guidance", text: "Rate your session and rebook anytime." },
  ];
  return (
    <section className="container-page py-12">
      <SectionHeading title="How it works" />
      <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Card as="li" key={s.title} className="relative p-6">
            <span className="absolute right-5 top-4 font-display text-5xl font-bold text-brand-100 dark:text-brand-800" aria-hidden>
              {i + 1}
            </span>
            <s.icon className="size-8 text-gold-500" aria-hidden />
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </Card>
        ))}
      </ol>
    </section>
  );
}

export function TrustSection() {
  const items = [
    { icon: BadgeCheck, title: "Verified astrologers", text: "Every astrologer is interviewed and background checked." },
    { icon: Lock, title: "100% private", text: "Contact details are never shared on either side." },
    { icon: Star, title: "Honest ratings", text: "Only users who completed a session can review." },
  ];
  return (
    <section className="bg-surface-muted py-12">
      <div className="container-page">
        <SectionHeading title="Why people trust us" />
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((it) => (
            <li key={it.title} className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-gold-300">
                <it.icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{it.title}</h3>
                <p className="text-sm text-muted">{it.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function OffersBanner() {
  return (
    <section className="container-page py-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="font-display text-2xl font-bold">First chat FREE</h2>
          <p className="mt-1 font-medium">New users get a free first consultation. Recharge ₹100, get ₹120.</p>
        </div>
        <ButtonLink href={routes.astrologers} size="lg" variant="light">
          Talk to an Astrologer
        </ButtonLink>
      </div>
    </section>
  );
}

export function Reviews({ locale, reviews }) {
  return (
    <section className="container-page py-12">
      <SectionHeading title="What our users say" />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} locale={locale} />
        ))}
      </ul>
    </section>
  );
}

export function ReviewCard({ review: r, locale, as = "li" }) {
  return (
    <Card as={as} className="p-5">
      <RatingStars value={r.rating} />
      <p className="mt-3 text-sm leading-relaxed">“{r.text}”</p>
      <p className="mt-4 text-sm font-semibold">{r.user}</p>
      <p className="text-xs text-muted">{formatDate(r.date, locale)}</p>
    </Card>
  );
}

export function FaqSection({ faqs }) {
  return (
    <section className="container-page py-12">
      <SectionHeading title="Frequently asked questions" />
      <Accordion items={faqs} className="max-w-3xl" />
    </section>
  );
}
