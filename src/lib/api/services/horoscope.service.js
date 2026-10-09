import { env } from "@/config/site";
import { http } from "../http";
import { buildMockHoroscope } from "../mock/horoscope";

/** Period key in IST, e.g. daily → 2026-10-03, monthly → 2026-10. */
export function periodKey(period, date = new Date()) {
  const ist = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const d = String(ist.getDate()).padStart(2, "0");
  if (period === "yearly") return `${y}`;
  if (period === "monthly") return `${y}-${m}`;
  if (period === "weekly") {
    const start = new Date(Date.UTC(y, 0, 1));
    const week = Math.ceil(((Date.UTC(y, ist.getMonth(), ist.getDate()) - start) / 86400000 + start.getUTCDay() + 1) / 7);
    return `${y}-W${String(week).padStart(2, "0")}`;
  }
  return `${y}-${m}-${d}`;
}

export const horoscopeService = {
  async get({ sign, period, locale }) {
    const dateKey = periodKey(period);
    if (env.useMocks) return buildMockHoroscope({ sign, period, locale, dateKey });
    return http(`/horoscope/${period}/${sign}`, {
      query: { lang: locale, date: dateKey },
      next: { revalidate: 300, tags: [`horoscope-${period}`] },
    });
  },
};
