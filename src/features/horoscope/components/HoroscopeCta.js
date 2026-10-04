import { MessageCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/Button";

/** "Talk to an astrologer about this" — required on every horoscope page. */
export function HoroscopeCta() {
  return (
    <aside className="bg-cosmic overflow-hidden rounded-3xl p-6 text-white sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Want a personal reading?</h2>
      <p className="mt-2 max-w-lg text-white/95">Talk to an astrologer about this horoscope — your first 3-minute chat is free.</p>
      <ButtonLink href={`${routes.astrologers}?online=1`} variant="light" size="lg" className="mt-5">
        <MessageCircle className="size-5" aria-hidden /> Talk to an astrologer about this
      </ButtonLink>
    </aside>
  );
}
