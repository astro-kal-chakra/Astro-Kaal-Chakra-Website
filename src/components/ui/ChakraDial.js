import { cn } from "@/lib/utils/cn";

/**
 * The Kaal Chakra (wheel of time) — the site's signature motif, drawn in saffron hairlines.
 * Outer ring: 27 nakshatra ticks + 12 rashi glyphs (slowly turning). Inner: 8-spoke chakra.
 * `children` render in the centre (e.g. today's panchang).
 */
const RASHI = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const point = (r, deg) => [200 + r * Math.sin((deg * Math.PI) / 180), 200 - r * Math.cos((deg * Math.PI) / 180)];
const f = (n) => Math.round(n * 100) / 100;

export function ChakraDial({ className, children }) {
  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <radialGradient id="kc-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" style={{ stopColor: "var(--surface-muted)" }} />
            <stop offset="0.7" style={{ stopColor: "var(--surface)" }} />
            <stop offset="1" style={{ stopColor: "var(--surface-muted)" }} />
          </radialGradient>
        </defs>

        {/* Turning outer ring: rashi + nakshatra ticks */}
        <g className="origin-center motion-safe:animate-orbit [transform-box:view-box]">
          <circle cx="200" cy="200" r="196" fill="none" stroke="#fdae74" strokeWidth="1" />
          <circle cx="200" cy="200" r="160" fill="none" stroke="#fdae74" strokeWidth="1" />
          {Array.from({ length: 27 }, (_, i) => {
            const [x1, y1] = point(196, (i * 360) / 27);
            const [x2, y2] = point(186, (i * 360) / 27);
            return <line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke="#f26b1d" strokeWidth="1.2" strokeLinecap="round" />;
          })}
          {RASHI.map((g, i) => {
            const deg = i * 30 + 15;
            const [x, y] = point(173, deg);
            const [a1, b1] = point(160, i * 30);
            const [a2, b2] = point(186, i * 30);
            return (
              <g key={g}>
                <line x1={f(a1)} y1={f(b1)} x2={f(a2)} y2={f(b2)} stroke="#fdba74" strokeWidth="1" />
                <text x={f(x)} y={f(y)} textAnchor="middle" dominantBaseline="central" fontSize="15" style={{ fill: "var(--accent-text)" }} transform={`rotate(${deg} ${f(x)} ${f(y)})`}>
                  {`${g}︎`}
                </text>
              </g>
            );
          })}
        </g>

        {/* Still inner chakra */}
        <circle cx="200" cy="200" r="146" fill="url(#kc-core)" stroke="#fed0aa" strokeWidth="1" />
        <circle cx="200" cy="200" r="146" fill="none" stroke="#f26b1d" strokeWidth="1" strokeDasharray="2 6" />
        {Array.from({ length: 8 }, (_, i) => {
          const [x1, y1] = point(118, i * 45 + 22.5);
          const [x2, y2] = point(146, i * 45 + 22.5);
          return <line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke="#fdae74" strokeWidth="1.2" />;
        })}
        <circle cx="200" cy="200" r="118" fill="none" stroke="#fed0aa" strokeWidth="1" />
      </svg>
      {children && <div className="absolute inset-[23%] flex items-center justify-center text-center">{children}</div>}
    </div>
  );
}

/** Tiny chakra mark for eyebrows and bullets. */
export function ChakraGlyph({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-4 shrink-0", className)} aria-hidden fill="none" stroke="currentColor">
      <circle cx="8" cy="8" r="6.5" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none" />
      {[0, 45, 90, 135].map((a) => (
        <line key={a} x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1" transform={`rotate(${a} 8 8)`} />
      ))}
    </svg>
  );
}
