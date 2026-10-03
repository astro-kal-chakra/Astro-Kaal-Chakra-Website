/** Normalise planet entries: "Su" or { label: "Su", retro: true, highlight: true }. */
export const toItem = (p) => (typeof p === "string" ? { label: p } : p);

export const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/** Planet labels laid out in centred rows around (cx, cy). Retrograde planets get a superscript "R". */
export function PlanetLabels({ items = [], cx, cy, perLine = 3, gap = 30, lineHeight = 17, fontSize = 13 }) {
  const rows = chunk(items.map(toItem), perLine);
  const top = cy - ((rows.length - 1) * lineHeight) / 2;
  return rows.map((row, r) =>
    row.map((p, i) => (
      <text
        key={`${r}-${i}`}
        x={cx + (i - (row.length - 1) / 2) * gap}
        y={top + r * lineHeight}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight="600"
        className={p.highlight ? "fill-gold-600 dark:fill-gold-400" : "fill-fg"}
      >
        <tspan>{p.label}</tspan>
        {p.retro && (
          <tspan fontSize={fontSize * 0.62} dy={-fontSize * 0.4} className="fill-red-600 dark:fill-red-400">
            R
          </tspan>
        )}
      </text>
    ))
  );
}
