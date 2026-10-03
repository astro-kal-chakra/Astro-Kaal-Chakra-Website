"use client";

import { useEffect, useRef } from "react";

/**
 * One gift emoji that floats up the video stage and fades out, then calls onDone.
 * Uses the Web Animations API, so no global CSS keyframes are needed.
 */
export function FloatingGift({ id, emoji, label, offset = 50, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const drift = (offset % 2 ? 1 : -1) * (20 + (offset % 30));
    const anim = el.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }]
        : [
            { transform: "translate(0, 0) scale(0.6)", opacity: 0 },
            { transform: "translate(0, -40px) scale(1.25)", opacity: 1, offset: 0.15 },
            { transform: `translate(${drift}px, -220px) scale(1)`, opacity: 0.9, offset: 0.75 },
            { transform: `translate(${drift * 1.3}px, -300px) scale(0.9)`, opacity: 0 },
          ],
      { duration: reduced ? 1200 : 2600, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
    );
    anim.onfinish = () => onDone(id);
    return () => anim.cancel();
  }, [id, offset, onDone]);

  return (
    <div ref={ref} className="pointer-events-none absolute bottom-16 flex flex-col items-center" style={{ left: `${offset}%` }} aria-hidden>
      <span className="text-5xl drop-shadow-[0_4px_12px_rgb(0_0_0/0.4)]">{emoji}</span>
      {label && <span className="mt-1 whitespace-nowrap rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">{label}</span>}
    </div>
  );
}
