"use client";

import { Children, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Infinite, auto-playing card carousel (Embla). Slides are passed as children so they can
 * be rendered on the server (crawlable links). Autoplay pauses on hover and is off for
 * visitors who prefer reduced motion.
 * @param {{ children: React.ReactNode, slideClassName?: string, delay?: number, label?: string, className?: string }} p
 *   `slideClassName` sets the slide width per breakpoint, e.g. "basis-1/2 md:basis-1/4".
 */
export function CardCarousel({ children, slideClassName = "basis-1/2 sm:basis-1/3 lg:basis-1/4", delay = 2500, label = "Carousel", className }) {
  // Created once; Embla needs a stable plugin instance across renders.
  const [autoplay] = useState(() => Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true }));
  const [viewportRef, api] = useEmblaCarousel({ loop: true, align: "start", dragFree: false }, [autoplay]);

  // Arrows only when there is something to scroll to (e.g. hidden when all slides already fit).
  const [scrollable, setScrollable] = useState(true);

  useEffect(() => {
    if (!api) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) api.plugins().autoplay?.stop();
    const update = () => setScrollable(api.canScrollNext() || api.canScrollPrev());
    api.on("init", update).on("reInit", update).on("resize", update);
    update();
    return () => {
      api.off("init", update).off("reInit", update).off("resize", update);
    };
  }, [api]);

  const prev = useCallback(() => api?.scrollPrev(), [api]);
  const next = useCallback(() => api?.scrollNext(), [api]);

  return (
    <div className={cn("relative", className)} role="region" aria-roledescription="carousel" aria-label={label}>
      {/* py/-my: room for card hover lift + shadow inside the clipped viewport */}
      <div ref={viewportRef} className="-my-3 overflow-hidden py-3">
        <ul className="-ml-3 flex touch-pan-y md:-ml-4">
          {Children.map(children, (child) => (
            <li className={cn("min-w-0 shrink-0 grow-0 pl-3 md:pl-4", slideClassName)}>{child}</li>
          ))}
        </ul>
      </div>
      {scrollable && (
        <>
          <CarouselButton side="left" onClick={prev} label="Previous" />
          <CarouselButton side="right" onClick={next} label="Next" />
        </>
      )}
    </div>
  );
}

function CarouselButton({ side, onClick, label }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/95 text-fg shadow-md backdrop-blur transition hover:border-brand-300 hover:text-brand-600 sm:size-10 dark:hover:text-gold-400",
        side === "left" ? "-left-2 sm:-left-3 lg:-left-5" : "-right-2 sm:-right-3 lg:-right-5"
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
