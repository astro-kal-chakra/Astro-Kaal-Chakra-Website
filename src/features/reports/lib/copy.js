import { hasLabel, label as t } from "@/lib/labels";

/**
 * A report's text. The dashboard (Content → Reports) is the source; the built-in copy keyed by slug is only
 * the fallback for the original reports. "What's included" lines are plain text "Title: one-line detail"
 * (older products stored label keys such as "birthChart", still understood here).
 */
export function reportCopy(r) {
  const key = (part) => `wallet.reports.catalog.${r.slug}.${part}`;
  const fallback = (part) => (hasLabel(key(part)) ? t(key(part)) : "");
  return {
    title: r.title || fallback("title") || "Astrology report",
    short: r.shortDescription || fallback("short"),
    description: r.description || fallback("description"),
    items: (r.includes || []).map((line) => {
      if (hasLabel(`wallet.reports.item.${line}`)) {
        return { key: line, title: t(`wallet.reports.item.${line}`), detail: hasLabel(`wallet.reports.itemDesc.${line}`) ? t(`wallet.reports.itemDesc.${line}`) : "" };
      }
      const i = line.indexOf(": ");
      return i > 0 ? { key: line, title: line.slice(0, i), detail: line.slice(i + 2) } : { key: line, title: line, detail: "" };
    }),
  };
}
