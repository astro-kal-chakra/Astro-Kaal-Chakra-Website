import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "./LocaleLink";
import { ChakraGlyph } from "./ChakraDial";

/**
 * Section title with an optional saffron eyebrow ("Today", "Free tools"…).
 * `align="center"` for standalone feature sections.
 */
export function SectionHeading({ title, subtitle, eyebrow, action, align = "left", className, as: Tag = "h2" }) {
  const centered = align === "center";
  return (
    <div className={cn("mb-7 flex items-end justify-between gap-4", centered && "flex-col items-center text-center", className)}>
      <div className={cn(centered && "max-w-2xl")}>
        {eyebrow && (
          <p className="eyebrow mb-2">
            <ChakraGlyph className="size-3.5 motion-safe:animate-orbit-fast" /> {eyebrow}
          </p>
        )}
        <Tag className="font-display text-[1.7rem] leading-tight tracking-tight text-fg sm:text-[2.1rem]">{title}</Tag>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </div>
      {action && (
        <LocaleLink
          href={action.href}
          className="group shrink-0 text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          {action.label} <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </LocaleLink>
      )}
    </div>
  );
}
