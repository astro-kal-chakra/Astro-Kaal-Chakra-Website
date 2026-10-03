import { MessageCircle, ShieldCheck, Sparkles, Star } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/Button";
import { AppStoreButtons } from "@/components/layout/AppStoreButtons";
import { HeroOrbit } from "./HeroOrbit";

export function Hero() {
  return (
    <section className="bg-cosmic relative overflow-hidden text-white">
      {/* decorative stars */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />
      <div className="container-page relative grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/15 px-3 py-1 text-sm font-medium text-white">
            <Sparkles className="size-4" aria-hidden /> First chat FREE
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient-gold">{"Get clarity from India's most trusted astrologers"}</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/95">Private chat and video consultations with verified Vedic astrologers. Your first chat is free.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={routes.astrologers} variant="light" size="lg">
              <MessageCircle className="size-5" aria-hidden /> Talk to an Astrologer
            </ButtonLink>
            <ButtonLink href={routes.kundli} size="lg" className="border border-white/30 bg-white/10 text-white hover:bg-white/20">
              Free Kundli
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white">
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-white" aria-hidden /> Verified astrologers
            </li>
            <li className="flex items-center gap-1.5">
              <Star className="size-4 fill-white text-white" aria-hidden /> 4.8 / 5
            </li>
          </ul>
          <AppStoreButtons className="mt-8" />
        </div>

        <HeroOrbit className="hidden md:block" />
      </div>
    </section>
  );
}
