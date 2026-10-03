/**
 * Circular progress ring, e.g. Guna Milan 27/36. Pure SVG, theme-aware.
 * @param {{ value: number, max: number, label?: string, size?: number }} props
 */
export function ScoreRing({ value, max, label, size = 160, tone = "brand" }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const tones = {
    brand: "stroke-brand-500 dark:stroke-gold-400",
    success: "stroke-green-500",
    warning: "stroke-amber-500",
    danger: "stroke-red-500",
  };
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-surface-muted" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={`${tones[tone]} transition-[stroke-dashoffset] duration-700`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-4xl font-semibold leading-none">
          {value}
          <span className="text-lg text-muted">/{max}</span>
        </span>
        {label && <span className="mt-1 px-4 text-xs text-muted">{label}</span>}
      </div>
    </div>
  );
}
