import { cn } from "@/lib/utils/cn";

/** Cosmic hero band used at the top of content & trust pages. */
export function ContentHero({ eyebrow, title, subtitle, children, className, align = "left" }) {
  return (
    <section className={cn("bg-cosmic relative overflow-hidden text-white", className)}>
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />
      <div className={cn("container-page relative py-12 sm:py-16", align === "center" && "text-center")}>
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/15 px-3 py-1 text-sm font-medium text-white">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          <span className="text-gradient-gold">{title}</span>
        </h1>
        {subtitle && (
          <p className={cn("mt-4 max-w-2xl text-lg text-white/95", align === "center" && "mx-auto")}>{subtitle}</p>
        )}
        {children && <div className={cn("mt-8", align === "center" && "flex justify-center")}>{children}</div>}
      </div>
    </section>
  );
}
