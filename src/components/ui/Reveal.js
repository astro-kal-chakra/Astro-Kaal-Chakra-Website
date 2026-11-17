"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Fades + slides its content up when it scrolls into view.
 * Server-rendered visible. Only content that is *below* the viewport on the first
 * IntersectionObserver report is hidden — that report comes after layout and the browser's
 * scroll restoration, so a refresh mid-page never hides (or re-animates) what is already on
 * screen or above it. Hiding skips the transition, so nothing ever visibly fades out.
 * Nothing is invisible to crawlers, no-JS visitors or reduced-motion users.
 */
export function Reveal({ as: Tag = "div", className, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          // On screen or already scrolled past: leave it alone for good.
          if (entry.boundingClientRect.top < window.innerHeight) {
            io.disconnect();
            return;
          }
          // Below the fold: hide, then wait for it to scroll in. The fade transition is only defined on the
          // "shown" state (globals.css), so hiding is instant without forcing a layout (no offsetHeight read).
          el.dataset.reveal = "hidden";
          return;
        }
        if (entry.isIntersecting) {
          el.dataset.reveal = "shown";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={cn("reveal", className)} {...props}>
      {children}
    </Tag>
  );
}
