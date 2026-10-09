"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

const RASHI = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const point = (r, deg) => [200 + r * Math.sin((deg * Math.PI) / 180), 200 - r * Math.cos((deg * Math.PI) / 180)];
const f = (n) => Math.round(n * 100) / 100;

/** Twinkling 4-point sparkles scattered over the page: [left %, top %, size px, delay s]. */
const SPARKLES = [
  [8, 18, 14, 0],
  [22, 62, 10, 1.4],
  [38, 30, 12, 2.6],
  [55, 82, 16, 0.8],
  [68, 12, 10, 3.2],
  [84, 70, 14, 1.9],
  [92, 40, 9, 2.2],
  [14, 88, 12, 3.8],
];

/**
 * The site's Kaal Chakra (wheel of time) as a page background: a large, faint zodiac wheel turning
 * slowly, planets circling on dashed orbits around a softly pulsing sun, a smaller counter-turning
 * wheel and twinkling sparkles. Line art in the brand saffron, so it sits well on light and dark.
 * SVG + CSS animations (GPU transforms) — cheap on phones; a gentle pointer parallax adds depth.
 * Fixed to the viewport; static for reduced motion.
 */
export function CelestialBackdrop({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return; // parallax only with a mouse
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      el.style.setProperty("--px", `${cur.x.toFixed(2)}px`);
      el.style.setProperty("--py", `${cur.y.toFixed(2)}px`);
      if (Math.abs(target.x - cur.x) > 0.05 || Math.abs(target.y - cur.y) > 0.05) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * -30;
      target.y = (e.clientY / window.innerHeight - 0.5) * -30;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Main wheel: top-right on desktop; on phones centred above the header so only the rings sweep behind the title */}
      <div className="absolute left-1/2 top-[-72vw] w-[140vw] opacity-45 [transform:translate(-50%,0)] sm:left-auto sm:right-[-12lvmin] sm:top-[6lvh] sm:w-[78lvmin] sm:opacity-80 sm:[transform:translate(var(--px,0px),var(--py,0px))]">
        <Wheel />
      </div>
      {/* Small counter-turning wheel, bottom-left (desktop) */}
      <div className="absolute bottom-[-14lvmin] left-[-10lvmin] hidden w-[42lvmin] opacity-50 [transform:translate(calc(var(--px,0px)*-0.6),calc(var(--py,0px)*-0.6))] md:block">
        <Wheel small />
      </div>
      {SPARKLES.map(([left, top, size, delay], i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute text-gold-500 motion-safe:animate-twinkle dark:text-gold-300"
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${delay}s` }}
        >
          <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

/** One wheel: turning rashi ring, dashed orbits with circling planets, pulsing sun. */
function Wheel({ small = false }) {
  const ring = small ? "motion-safe:[animation:orbit_160s_linear_infinite_reverse]" : "motion-safe:[animation:orbit_140s_linear_infinite]";
  return (
    <svg viewBox="0 0 400 400" className="block w-full text-brand-400 dark:text-brand-300">
      <defs>
        <radialGradient id={small ? "cb-sun-s" : "cb-sun"} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fdba74" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#fb8a3c" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fb8a3c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sun */}
      <circle cx="200" cy="200" r="70" fill={`url(#${small ? "cb-sun-s" : "cb-sun"})`} className="origin-center motion-safe:[animation:breathe_6s_ease-in-out_infinite] [transform-box:view-box]" />
      <circle cx="200" cy="200" r="9" fill="#fb8a3c" opacity="0.5" />

      {/* turning outer ring: rashi + nakshatra ticks */}
      <g className={cn("origin-center [transform-box:view-box]", ring)} fill="none" stroke="currentColor">
        <circle cx="200" cy="200" r="196" strokeWidth="0.8" opacity="0.7" />
        <circle cx="200" cy="200" r="164" strokeWidth="0.8" opacity="0.55" />
        {Array.from({ length: 27 }, (_, i) => {
          const [x1, y1] = point(196, (i * 360) / 27);
          const [x2, y2] = point(188, (i * 360) / 27);
          return <line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} strokeWidth="1" opacity="0.8" />;
        })}
        {RASHI.map((g, i) => {
          const deg = i * 30 + 15;
          const [x, y] = point(180, deg);
          const [a1, b1] = point(164, i * 30);
          const [a2, b2] = point(188, i * 30);
          return (
            <g key={g}>
              <line x1={f(a1)} y1={f(b1)} x2={f(a2)} y2={f(b2)} strokeWidth="0.8" opacity="0.6" />
              {!small && (
                <text x={f(x)} y={f(y)} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="currentColor" stroke="none" opacity="0.9" transform={`rotate(${deg} ${f(x)} ${f(y)})`}>
                  {`${g}︎`}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* orbits with circling planets (each group turns at its own speed) */}
      {[
        { r: 132, dur: 48, size: 5, start: 20 },
        { r: 104, dur: 34, size: 4, start: 200 },
        { r: 76, dur: 22, size: 3.5, start: 120 },
      ].map(({ r, dur, size, start }) => (
        <g key={r}>
          <circle cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.6" />
          <g className="origin-center [transform-box:view-box]" style={{ transform: `rotate(${start}deg)` }}>
            <g className="origin-center [transform-box:view-box] motion-safe:[animation:orbit_var(--d)_linear_infinite]" style={{ "--d": `${dur}s` }}>
              <circle cx="200" cy={200 - r} r={size * 2.4} fill="#fb8a3c" opacity="0.18" />
              <circle cx="200" cy={200 - r} r={size} fill="#f26b1d" opacity="0.85" />
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}
