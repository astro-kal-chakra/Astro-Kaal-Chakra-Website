import { cn } from "@/lib/utils/cn";
import { PlanetLabels } from "./chartUtils";

/**
 * Label anchors for each house in a 400×400 North Indian (diamond) chart.
 * House 1 is the top diamond and houses run counter-clockwise.
 * c = planets centre, s = sign-number position (towards the inner vertex), side = narrow triangle.
 */
const HOUSES = {
  1: { c: [200, 88], s: [200, 172] },
  2: { c: [100, 36], s: [100, 82] },
  3: { c: [36, 100], s: [82, 100], side: true },
  4: { c: [88, 200], s: [172, 200] },
  5: { c: [36, 300], s: [82, 300], side: true },
  6: { c: [100, 364], s: [100, 318] },
  7: { c: [200, 312], s: [200, 228] },
  8: { c: [300, 364], s: [300, 318] },
  9: { c: [364, 300], s: [318, 300], side: true },
  10: { c: [312, 200], s: [228, 200] },
  11: { c: [364, 100], s: [318, 100], side: true },
  12: { c: [300, 36], s: [300, 82] },
};

/**
 * North Indian Lagna chart as responsive inline SVG.
 * @param {{
 *   houses: Record<number, Array<string | { label: string, retro?: boolean, highlight?: boolean }>>,
 *   signs: Record<number, number>,   // house → sign number 1-12 (house 1 = ascendant sign)
 *   title: string,                    // accessible name
 *   className?: string
 * }} props
 */
export function ChartNorthIndian({ houses = {}, signs = {}, title, className }) {
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={title} className={cn("h-auto w-full max-w-md", className)}>
      <title>{title}</title>
      <rect x="2" y="2" width="396" height="396" rx="6" className="fill-brand-50 stroke-brand-400 dark:fill-brand-950/60 dark:stroke-brand-500" strokeWidth="2" />
      <g className="stroke-brand-400 dark:stroke-brand-500" strokeWidth="1.5" fill="none">
        <line x1="2" y1="2" x2="398" y2="398" />
        <line x1="398" y1="2" x2="2" y2="398" />
        <polygon points="200,2 398,200 200,398 2,200" />
      </g>
      {Object.entries(HOUSES).map(([h, { c, s, side }]) => (
        <g key={h}>
          {signs[h] != null && (
            <text x={s[0]} y={s[1]} textAnchor="middle" dominantBaseline="middle" fontSize="12" className="fill-brand-500 dark:fill-gold-400">
              {signs[h]}
            </text>
          )}
          <PlanetLabels items={houses[h]} cx={c[0]} cy={c[1]} perLine={side ? 2 : 3} gap={side ? 26 : 30} />
        </g>
      ))}
    </svg>
  );
}
