import { useId } from "react";
import { cn } from "@/lib/utils/cn";
import { ART_TONES } from "../data";

const ring = (n, r, cx = 100, cy = 100) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const f = (n) => Math.round(n * 10) / 10;

/** Bead with a soft highlight. */
function Bead({ x, y, r, g }) {
  return (
    <g>
      <circle cx={f(x)} cy={f(y)} r={r} fill={`url(#${g}-bead)`} />
      <circle cx={f(x - r * 0.35)} cy={f(y - r * 0.35)} r={r * 0.3} fill="#fff" opacity="0.45" />
    </g>
  );
}

const ART = {
  mala: (g, t) => (
    <>
      {ring(30, 58).map(([x, y], i) => (
        <Bead key={i} x={x} y={y} r={7} g={g} />
      ))}
      <path d="M100 158 L100 176" stroke={t.accent} strokeWidth="3" />
      <path d="M92 176 h16 l-4 18 h-8 Z" fill={t.accent} />
      <Bead x={100} y={158} r={9} g={g} />
    </>
  ),
  bracelet: (g) => (
    <>
      <ellipse cx="100" cy="100" rx="62" ry="40" fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="2" />
      {ring(16, 1, 0, 0).map(([dx, dy], i) => (
        <Bead key={i} x={100 + dx * 62} y={100 + dy * 40} r={11 - Math.abs(dy) * 1.5} g={g} />
      ))}
    </>
  ),
  rudraksha: (g, t) => (
    <>
      <circle cx="100" cy="100" r="54" fill={`url(#${g}-bead)`} />
      {[-30, -15, 0, 15, 30].map((dx) => (
        <path key={dx} d={`M${100 + dx} 50 Q${100 + dx * 1.6} 100 ${100 + dx} 150`} fill="none" stroke={t.accent} strokeWidth="3" strokeLinecap="round" opacity="0.65" />
      ))}
      {ring(14, 30).map(([x, y], i) => (
        <circle key={i} cx={f(x)} cy={f(y)} r="3" fill={t.accent} opacity="0.45" />
      ))}
      <ellipse cx="82" cy="74" rx="16" ry="10" fill="#fff" opacity="0.3" />
      <path d="M100 46 V30" stroke={t.accent} strokeWidth="3" />
    </>
  ),
  gem: (g, t) => (
    <>
      <path d="M58 82 L80 54 H120 L142 82 L100 152 Z" fill={`url(#${g}-bead)`} />
      <path d="M58 82 H142 M80 54 L92 82 L100 152 L108 82 L120 54 M92 82 L100 54 L108 82" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 54 L92 82 H58 Z" fill="#fff" opacity="0.28" />
      <path d="M58 82 L80 54 H120 L142 82 L100 152 Z" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  yantra: (g, t) => (
    <>
      <rect x="44" y="44" width="112" height="112" fill="none" stroke={t.accent} strokeWidth="3" />
      <rect x="54" y="54" width="92" height="92" fill="none" stroke={t.accent} strokeWidth="1.5" opacity="0.6" />
      <circle cx="100" cy="100" r="40" fill="none" stroke={t.accent} strokeWidth="2" />
      <path d="M100 66 L130 118 H70 Z" fill={`url(#${g}-bead)`} stroke={t.accent} strokeWidth="2" strokeLinejoin="round" />
      <path d="M100 134 L70 82 H130 Z" fill="none" stroke={t.accent} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="100" cy="100" r="4" fill={t.accent} />
    </>
  ),
  diya: (g, t) => (
    <>
      <path d="M100 52 C112 70 112 84 100 92 C88 84 88 70 100 52 Z" fill="#fde68a" />
      <path d="M100 64 C106 74 106 82 100 86 C94 82 94 74 100 64 Z" fill="#f97316" />
      <path d="M50 104 Q100 98 150 104 Q140 146 100 148 Q60 146 50 104 Z" fill={`url(#${g}-bead)`} stroke={t.accent} strokeWidth="2.5" />
      <path d="M62 112 Q100 120 138 112" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
      <rect x="84" y="148" width="32" height="10" rx="3" fill={t.accent} />
    </>
  ),
};

/**
 * Illustrated product image (pure SVG, no network): a soft gradient tile with a drawing for the product type,
 * slowly glowing; it lifts slightly when its card is hovered (`group` on the card).
 */
export function ProductArt({ product, className }) {
  const g = `pa${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const t = ART_TONES[product.tone] || ART_TONES.saffron;
  const draw = ART[product.art] || ART.mala;
  return (
    <div className={cn("relative aspect-square overflow-hidden", className)} aria-hidden>
      {/* studio backdrop: warm wall fading to a lighter floor, a soft glow in the product colour */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f6e6d2] via-[#fbf1e4] to-[#efdcc5] dark:from-[#2a1a0f] dark:via-[#22150c] dark:to-[#1a1009]" />
      <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(60% 45% at 50% 42%, ${t.from}, transparent 75%)` }} />
      {/* faint chakra rings */}
      <div className="absolute left-1/2 top-[40%] size-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 dark:border-white/5" />
      <div className="absolute left-1/2 top-[40%] size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/60 dark:border-white/5" />
      {/* pedestal */}
      <div className="absolute bottom-[13%] left-1/2 h-[9%] w-[62%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-[#fffaf3] to-[#e7d2b8] shadow-[0_10px_20px_-8px_rgb(120_53_15/0.35)] dark:from-[#3a2617] dark:to-[#21140b]" />
      <svg viewBox="0 0 200 200" className="absolute inset-x-0 bottom-[17%] mx-auto h-[66%] w-auto max-w-[88%] transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105">
        <defs>
          <radialGradient id={`${g}-bead`} cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor={t.from} />
            <stop offset="1" stopColor={t.to} />
          </radialGradient>
          <filter id={`${g}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={t.accent} floodOpacity="0.25" />
          </filter>
        </defs>
        <g filter={`url(#${g}-shadow)`}>{draw(g, t)}</g>
      </svg>
    </div>
  );
}
