/**
 * Hero background artwork (inline SVG, no image request): dawn over a temple ghat.
 * A saffron sunrise glows behind the Kaal Chakra, temple shikharas line the river,
 * and the art fades out on the left so the headline stays readable. Theme-aware.
 */

// Deterministic "random" so server and client render the same stars
const seeded = (n) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const STARS = Array.from({ length: 34 }, (_, i) => ({ x: 780 + seeded(i) * 800, y: 70 + seeded(i + 99) * 230, r: 0.8 + seeded(i + 7) * 1.6 }));

/** Nagara-style shikhara: tower, amalaka, kalasha and a flag. */
function Shikhara({ x, base, w, h, flag = false }) {
  const top = base - h;
  const tower = `M${x - w / 2} ${base} L${x - w / 2} ${base - h * 0.32} Q${x - w * 0.46} ${top + h * 0.12} ${x} ${top} Q${x + w * 0.46} ${top + h * 0.12} ${x + w / 2} ${base - h * 0.32} L${x + w / 2} ${base} Z`;
  return (
    <g>
      <path d={tower} />
      <ellipse cx={x} cy={top - 3} rx={w * 0.16} ry={3.5} />
      <path d={`M${x - 2.5} ${top - 6} Q${x} ${top - 16} ${x + 2.5} ${top - 6} Z`} />
      {flag && (
        <>
          <line x1={x} y1={top - 14} x2={x} y2={top - 40} strokeWidth="1.4" className="stroke-current" />
          <path d={`M${x} ${top - 40} L${x + 18} ${top - 34} L${x} ${top - 28} Z`} className="fill-brand-500" />
        </>
      )}
    </g>
  );
}

/** Low mandapa with a dome. */
function Mandapa({ x, base, w, h }) {
  return <path d={`M${x - w / 2} ${base} L${x - w / 2} ${base - h} Q${x} ${base - h - w * 0.55} ${x + w / 2} ${base - h} L${x + w / 2} ${base} Z`} />;
}

export function HeroBackdrop() {
  // Sun sits behind the Kaal Chakra dial; tall temples stand either side of it, low ones below it.
  const SUN = { x: 1144, y: 415 };
  const horizon = 700;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1600 760"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full [mask-image:linear-gradient(to_right,transparent_0%,black_42%)] max-md:[mask-image:linear-gradient(to_bottom,transparent_30%,black_75%)]"
      >
        <defs>
          <radialGradient id="hb-sun" cx={SUN.x} cy={SUN.y} r="360" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fb8a3c" stopOpacity="0.32" />
            <stop offset="0.45" stopColor="#fdae74" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fdae74" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hb-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fdba74" stopOpacity="0.22" />
            <stop offset="1" stopColor="#fdba74" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sunrise behind the chakra */}
        <circle cx={SUN.x} cy={SUN.y} r="360" fill="url(#hb-sun)" />
        <g className="stroke-brand-300/40 dark:stroke-brand-700/40" strokeWidth="1" fill="none">
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * Math.PI) / 12;
            return <line key={i} x1={SUN.x + Math.cos(a) * 250} y1={SUN.y + Math.sin(a) * 250} x2={SUN.x + Math.cos(a) * 330} y2={SUN.y + Math.sin(a) * 330} />;
          })}
          <circle cx={SUN.x} cy={SUN.y} r="345" strokeDasharray="1 9" />
        </g>

        {/* Stars fading into dawn */}
        <g className="fill-brand-400/50 dark:fill-brand-300/40">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} />
          ))}
        </g>

        {/* Birds */}
        <g className="stroke-brand-700/30 dark:stroke-brand-300/30" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M760 190 q8 -8 16 0 q8 -8 16 0" />
          <path d="M805 170 q6 -6 12 0 q6 -6 12 0" />
          <path d="M840 205 q5 -5 10 0 q5 -5 10 0" />
        </g>

        {/* Far skyline */}
        <g className="fill-brand-100 text-brand-200 dark:fill-brand-950 dark:text-brand-900">
          <Mandapa x={700} base={horizon} w={80} h={36} />
          <Shikhara x={770} base={horizon} w={56} h={120} />
          <Mandapa x={1050} base={horizon} w={70} h={28} />
          <Mandapa x={1240} base={horizon} w={70} h={28} />
          <Shikhara x={1520} base={horizon} w={64} h={130} />
        </g>

        {/* Near skyline: the ghat temples */}
        <g className="fill-brand-200/80 text-brand-300 dark:fill-brand-900/70 dark:text-brand-800">
          <rect x="0" y={horizon - 18} width="1600" height="18" />
          <Shikhara x={865} base={horizon - 18} w={84} h={190} flag />
          <Mandapa x={940} base={horizon - 18} w={70} h={34} />
          <Mandapa x={1144} base={horizon - 18} w={130} h={30} />
          <Mandapa x={1350} base={horizon - 18} w={80} h={36} />
          <Shikhara x={1430} base={horizon - 18} w={96} h={220} flag />
        </g>

        {/* Ghat steps */}
        <g className="stroke-brand-300/50 dark:stroke-brand-800/60" strokeWidth="1.2">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" y1={horizon + 6 + i * 8} x2="1600" y2={horizon + 6 + i * 8} />
          ))}
        </g>

        {/* River and reflections */}
        <rect x="0" y={horizon + 36} width="1600" height="40" fill="url(#hb-water)" />
        <g className="stroke-brand-300/40 dark:stroke-brand-700/40" strokeWidth="1.4" strokeLinecap="round">
          {[
            [1090, 742, 1200],
            [1040, 752, 1250],
            [820, 746, 910],
            [1390, 748, 1480],
          ].map(([x1, y, x2]) => (
            <line key={`${x1}-${y}`} x1={x1} y1={y} x2={x2} y2={y} />
          ))}
        </g>
      </svg>
    </div>
  );
}
