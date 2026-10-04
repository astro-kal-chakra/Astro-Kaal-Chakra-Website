import { BadgeCheck, Gift, IndianRupee, MessageCircle, Phone, Video } from "lucide-react";
import { routes } from "@/config/routes";
import { label as t } from "@/lib/labels";
import { mockPanchang } from "@/lib/api/mock/astro-tools";
import { formatTime, isoDateIn } from "@/features/tools/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { ChakraDial } from "@/components/ui/ChakraDial";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { HeroBackdrop } from "./HeroBackdrop";

const PROMISES = [
  { icon: BadgeCheck, text: "KYC-verified astrologers" },
  { icon: Gift, text: "First 3-minute chat free" },
  { icon: IndianRupee, text: "Per-minute rates shown upfront" },
];

const MODES = [
  { icon: MessageCircle, label: "Chat", href: `${routes.astrologers}?mode=chat` },
  { icon: Phone, label: "Call", href: `${routes.astrologers}?mode=call` },
  { icon: Video, label: "Video", href: `${routes.astrologers}?mode=video` },
];

/** Today's panchang for New Delhi, shown inside the Kaal Chakra. Static (mock) until the panchang API is wired. */
function TodayInChakra() {
  const date = isoDateIn(new Date());
  const p = mockPanchang({ date, place: { lat: 28.61, lng: 77.21, name: "New Delhi" } });
  const tithi = p.tithi.index === 29 ? "Amavasya" : t(`tools.names.tithis.${p.tithi.index % 15}`);
  return (
    <LocaleLink href={routes.panchang} className="group flex flex-col items-center gap-0.5 px-2" aria-label="Today's panchang">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">Today · New Delhi</span>
      <span className="mt-1 font-display text-xl leading-tight text-fg sm:text-2xl">{tithi}</span>
      <span className="text-xs text-muted">{t(`tools.names.paksha.${p.tithi.paksha}`)}</span>
      <span className="mt-1 text-sm font-medium text-fg">{t(`tools.names.nakshatras.${p.nakshatra.index}`)}</span>
      <span className="mt-2 grid grid-cols-2 gap-x-4 text-[11px] leading-snug text-muted">
        <span>Sunrise</span>
        <span>Rahu Kaal</span>
        <span translate="no" className="notranslate font-semibold text-fg">{formatTime(p.sunrise)}</span>
        <span translate="no" className="notranslate font-semibold text-fg">{formatTime(p.rahuKaal.start)}</span>
      </span>
      <span className="mt-2 text-[11px] font-semibold text-accent group-hover:underline">Full panchang →</span>
    </LocaleLink>
  );
}

export function Hero() {
  return (
    <section className="bg-aura relative overflow-hidden border-b border-line">
      <HeroBackdrop />
      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
        <div>
          <p className="eyebrow">Kaal Chakra · the wheel of time</p>
          <h1 className="mt-4 font-display text-[2.5rem] leading-[1.08] tracking-tight text-fg sm:text-6xl">
            Ask the astrologer.
            <br />
            <span className="text-accent">Find clarity</span> today.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Chat, call or video with verified Vedic astrologers on love, career, marriage and health. See each astrologer&apos;s per-minute rate before you
            start, and end the session whenever you like.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={routes.astrologers} size="lg">
              <MessageCircle className="size-5" aria-hidden /> Talk to an astrologer
            </ButtonLink>
            <ButtonLink href={routes.kundli} size="lg" variant="soft">
              Free Kundli
            </ButtonLink>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-fg">
            {PROMISES.map((p) => (
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
                className="flex items-center gap-1.5 border-r border-line px-4 py-2 text-sm font-medium text-muted transition last:border-r-0 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/40 dark:hover:text-brand-200"
              >
                <m.icon className="size-4" aria-hidden /> {m.label}
              </LocaleLink>
            ))}
          </nav>
        </div>

        <ChakraDial className="mx-auto max-w-[420px]">
          <TodayInChakra />
        </ChakraDial>
      </div>
    </section>
  );
}
