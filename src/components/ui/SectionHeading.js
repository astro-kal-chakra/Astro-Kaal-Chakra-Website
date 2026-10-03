import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "./LocaleLink";

export function SectionHeading({ title, subtitle, action, className, as: Tag = "h2" }) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div>
        <Tag className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</Tag>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action && (
        <LocaleLink href={action.href} className="shrink-0 text-sm font-semibold text-brand-600 hover:underline dark:text-gold-400">
          {action.label} →
        </LocaleLink>
      )}
    </div>
  );
}
