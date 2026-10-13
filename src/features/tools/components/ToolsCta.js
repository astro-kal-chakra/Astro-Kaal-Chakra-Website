import { MessageCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/Button";
import { label as t } from "@/lib/labels";

/** "Talk to an astrologer" banner for tool pages. Pass i18n keys to override the copy. */
export function ToolsCta({ titleKey = "tools.common.ctaTitle", textKey = "tools.common.ctaText" }) {
  return (
    <aside className="bg-cosmic overflow-hidden rounded-3xl p-6 text-white sm:p-8">
      <h2 className="font-display text-2xl font-semibold">{t(titleKey)}</h2>
      <p className="mt-2 max-w-xl text-white/95">{t(textKey)}</p>
      <ButtonLink href={`${routes.astrologers}?online=1`} variant="light" size="lg" className="mt-5 h-auto min-h-12 w-full whitespace-normal py-3 text-center leading-snug sm:w-auto">
        <MessageCircle className="size-5" aria-hidden /> Talk to an astrologer
      </ButtonLink>
    </aside>
  );
}
