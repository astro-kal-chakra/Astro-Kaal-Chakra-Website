import { MessageCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/** "Talk to an astrologer" call-to-action banner. */
export function ContentCta({ title, text, cta, href = routes.astrologers, className }) {
  return (
    <section className={cn("bg-cosmic relative overflow-hidden rounded-3xl p-6 text-white sm:p-10", className)}>
      <span className="pointer-events-none absolute -right-6 -top-10 font-display text-[10rem] leading-none text-white/15" aria-hidden>
        ☉
      </span>
      <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
          {text && <p className="mt-2 max-w-xl text-white/95">{text}</p>}
        </div>
        <ButtonLink href={href} variant="light" size="lg" className="shrink-0">
          <MessageCircle className="size-5" aria-hidden /> {cta}
        </ButtonLink>
      </div>
    </section>
  );
}
