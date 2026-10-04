import { cn } from "@/lib/utils/cn";

/** Hero band at the top of content & trust pages: white with a soft saffron glow (matches the home hero). */
export function ContentHero({ eyebrow, title, subtitle, children, className, align = "left" }) {
  return (
    <section className={cn("bg-aura relative overflow-hidden border-b border-line", className)}>
      <div className={cn("container-page relative py-12 sm:py-16", align === "center" && "text-center")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-display text-4xl leading-tight text-fg sm:text-5xl">{title}</h1>
        {subtitle && <p className={cn("mt-4 max-w-2xl text-lg text-muted", align === "center" && "mx-auto")}>{subtitle}</p>}
        {children && <div className={cn("mt-8", align === "center" && "flex justify-center")}>{children}</div>}
      </div>
    </section>
  );
}
