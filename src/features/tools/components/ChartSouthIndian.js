import { cn } from "@/lib/utils/cn";
import { PlanetLabels } from "./chartUtils";

/** Fixed sign cells (col, row) in a 4×4 grid: Pisces top-left, then clockwise. Index 0 = Aries. */
const CELLS = [
  [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3],
  [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0],
];
const SIZE = 100;

/**
 * South Indian Lagna chart as responsive inline SVG. Signs are fixed; the ascendant cell
 * is marked with a diagonal line.
 * @param {{
 *   signs: Record<number, Array<string | { label: string, retro?: boolean, highlight?: boolean }>>,  // sign number 1-12 → planets
 *   ascendantSign: number,          // 1-12
 *   signLabels?: string[],          // 12 short sign names, Aries first
 *   centerLabel?: string,
 *   title: string,
 *   className?: string
 * }} props
 */
export function ChartSouthIndian({ signs = {}, ascendantSign, signLabels = [], centerLabel, title, className }) {
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={title} className={cn("h-auto w-full max-w-md", className)}>
      <title>{title}</title>
      {CELLS.map(([col, row], i) => {
        const x = col * SIZE;
        const y = row * SIZE;
        const num = i + 1;
        return (
          <g key={num}>
            <rect
              x={x + 1}
              y={y + 1}
              width={SIZE - 2}
              height={SIZE - 2}
              rx="4"
              strokeWidth="1.5"
              className={
                num === ascendantSign
                  ? "fill-gold-100 stroke-gold-500 dark:fill-gold-700/25 dark:stroke-gold-400"
                  : "fill-brand-50 stroke-brand-400 dark:fill-brand-950/60 dark:stroke-brand-500"
              }
            />
            {num === ascendantSign && (
              <line x1={x + 1} y1={y + 28} x2={x + 28} y2={y + 1} strokeWidth="1.5" className="stroke-gold-600 dark:stroke-gold-400" />
            )}
            <text x={x + SIZE - 8} y={y + 16} textAnchor="end" fontSize="11" className="fill-brand-500 dark:fill-gold-400">
              {signLabels[i] || num}
            </text>
            <PlanetLabels items={signs[num]} cx={x + SIZE / 2} cy={y + SIZE / 2 + 8} perLine={3} gap={28} lineHeight={16} fontSize={12.5} />
          </g>
        );
      })}
      <rect x="101" y="101" width="198" height="198" rx="6" className="fill-surface stroke-brand-300 dark:stroke-brand-700" strokeWidth="1" />
      {centerLabel && (
        <text x="200" y="200" textAnchor="middle" dominantBaseline="middle" fontSize="16" className="fill-muted font-display">
          {centerLabel}
        </text>
      )}
    </svg>
  );
}
