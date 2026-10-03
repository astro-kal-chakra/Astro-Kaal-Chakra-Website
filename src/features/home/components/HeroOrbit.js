import { ZODIAC_SIGNS } from "@/constants/zodiac";

// "︎" forces text presentation so signs render as gold glyphs, not emoji tiles.
const TEXT = "︎";

const STARS = [
  [8, 12, 0], [18, 78, 0.6], [30, 4, 1.2], [44, 92, 0.3], [62, 6, 1.8], [72, 88, 0.9],
  [86, 18, 1.5], [92, 70, 0.4], [4, 50, 2.1], [52, 98, 1.1], [96, 42, 2.4], [24, 30, 1.7],
];

/** Planets on the inner rings: [size px, ring inset %, animation, colour]. */
const PLANETS = [
  ["size-3", "inset-[26%]", "animate-orbit-fast", "bg-white shadow-[0_0_12px_rgb(255_255_255/0.9)]"],
  ["size-2.5", "inset-[18%]", "animate-orbit-mid", "bg-brand-100 shadow-[0_0_12px_rgb(255_234_213/0.9)]"],
  ["size-4", "inset-[10%]", "animate-orbit-slow", "bg-gold-200 shadow-[0_0_14px_rgb(255_255_255/0.9)]"],
];

/**
 * Animated solar-system illustration for the home hero. Pure CSS — no JS cost.
 * The 12 signs orbit the sun while counter-rotating so they always stay upright.
 * Respects prefers-reduced-motion (everything stops).
 */
export function HeroOrbit({ className = "" }) {
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-sm select-none ${className}`} aria-hidden>
      {/* Twinkling stars */}
      {STARS.map(([top, left, delay], i) => (
        <span
          key={i}
          className="absolute size-1 animate-twinkle rounded-full bg-white motion-reduce:animate-none"
          style={{ top: `${top}%`, left: `${left}%`, animationDelay: `${delay}s` }}
        />
      ))}

      {/* Static rings */}
      <div className="absolute inset-0 rounded-full border border-white/40" />
      <div className="absolute inset-[10%] rounded-full border border-dashed border-white/30" />
      <div className="absolute inset-[18%] rounded-full border border-white/20" />
      <div className="absolute inset-[26%] rounded-full border border-white/20" />

      {/* Planets */}
      {PLANETS.map(([size, inset, anim, color], i) => (
        <div key={i} className={`absolute ${inset} ${anim} motion-reduce:animate-none`}>
          <span className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${size} ${color}`} />
        </div>
      ))}

      {/* Zodiac ring: whole ring rotates; each glyph counter-rotates to stay upright */}
      <div className="absolute inset-0 animate-orbit motion-reduce:animate-none">
        {ZODIAC_SIGNS.map((s, i) => {
          const angle = i * 30;
          return (
            <div key={s.slug} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
              <div className="absolute left-1/2 top-0" style={{ transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}>
                <span className="flex size-9 animate-orbit-reverse items-center justify-center rounded-full border border-white/60 bg-white/20 text-lg text-white shadow-[0_0_14px_rgb(255_255_255/0.35)] backdrop-blur-sm motion-reduce:animate-none">
                  {s.symbol + TEXT}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sun */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* rotating rays */}
        <div className="absolute size-[58%] animate-sun-rays rounded-full bg-[repeating-conic-gradient(from_0deg,rgb(255_255_255/0.25)_0deg_6deg,transparent_6deg_18deg)] [mask-image:radial-gradient(circle,black_45%,transparent_70%)] motion-reduce:animate-none" />
        <div className="relative flex size-[38%] animate-sun-pulse items-center justify-center rounded-full bg-gradient-to-br from-white via-brand-50 to-gold-200 motion-reduce:animate-none">
          <span className="text-6xl leading-none text-brand-600">{"☉" + TEXT}</span>
        </div>
      </div>
    </div>
  );
}
