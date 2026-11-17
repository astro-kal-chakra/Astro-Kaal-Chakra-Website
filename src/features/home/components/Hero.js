import { BadgeCheck, Gift, IndianRupee, Lock, MessageCircle, Phone, Video } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/Button";
import { ChakraDial } from "@/components/ui/ChakraDial";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ParticleField } from "@/components/ui/ParticleField";
import { HeroBackdrop } from "./HeroBackdrop";
import { TodayPanchang } from "./TodayPanchang";

/** Free-chat line follows the admin setting (hidden when free chats are off). */
const promises = (freeChat) => [
  { icon: BadgeCheck, text: "KYC-verified astrologers" },
  freeChat?.enabled ? { icon: Gift, text: `First ${freeChat.minutes}-minute chat free` } : { icon: Lock, text: "Private & secure" },
  { icon: IndianRupee, text: "Per-minute rates shown upfront" },
];

const MODES = [
  { icon: MessageCircle, label: "Chat", href: `${routes.astrologers}?mode=chat` },
  { icon: Phone, label: "Call", href: `${routes.astrologers}?mode=call` },
  { icon: Video, label: "Video", href: `${routes.astrologers}?mode=video` },
];

export function Hero({ panchang, freeChat }) {
  return (
    <section className="bg-aura relative overflow-hidden border-b border-line">
      <HeroBackdrop />
      {/* Twinkling, pointer-reactive stars behind the headline and dial (lighter than the horoscope pages) */}
      <ParticleField contained density={0.55} />
      {/* Bottom padding on md+ grows with the width: the backdrop's ground strip (scaled to the full width)
          gets taller on wide screens and must stay below the Chat / Call / Video row. */}
      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-12 md:grid-cols-[1.15fr_1fr] md:pt-20 md:pb-[max(5rem,calc(4.9vw+1.75rem))]">
        <div>
          <p className="eyebrow">Ask the astrologer · Find clarity today</p>
          {/* The H1 carries the main search phrase ("talk to online astrologer") for Google. */}
          <h1 className="mt-4 font-display text-[2.3rem] leading-[1.08] tracking-tight text-fg sm:text-[3.4rem]">
            Talk to an <span className="text-accent">Online Astrologer</span>
            <span className="mt-3 block text-[1.35rem] leading-snug text-muted sm:text-[1.9rem]">
              Chat, Call &amp; Video with Verified Vedic Astrologers
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Chat, call or video with verified Vedic astrologers on love, career, marriage and health. See each astrologer&apos;s per-minute rate before you
            start, end the session whenever you like, and find clarity today.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={routes.astrologers} size="lg">
              <MessageCircle className="size-5" aria-hidden /> Talk to an astrologer
            </ButtonLink>
            <ButtonLink href={routes.kundli} size="lg" variant="soft">
              Get your Free Kundli
            </ButtonLink>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-fg">
            {promises(freeChat).map((p) => (
              <li key={p.text} className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
                  <p.icon className="size-4" aria-hidden />
                </span>
                {p.text}
              </li>
            ))}
          </ul>

          <nav aria-label="Consult by" className="mt-8 inline-flex overflow-hidden rounded-full border border-line bg-surface">
            {MODES.map((m) => (
              <LocaleLink
                key={m.label}
                href={m.href}
                rel="nofollow" // filter shortcut (?mode=): keeps parameter URLs out of crawling
                className="flex items-center gap-1.5 border-r border-line px-4 py-2 text-sm font-medium text-muted transition last:border-r-0 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/40 dark:hover:text-brand-200"
              >
                <m.icon className="size-4" aria-hidden /> {m.label}
              </LocaleLink>
            ))}
          </nav>
        </div>

        {/* rem, not px: the dial grows with the rest of the page on large screens */}
        <ChakraDial className="mx-auto max-w-[26.25rem]">
          {/* Today's panchang for the visitor's city (New Delhi until the browser knows it) */}
          <TodayPanchang initial={panchang} />
        </ChakraDial>
      </div>
    </section>
  );
}
