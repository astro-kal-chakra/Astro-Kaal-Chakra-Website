import { ZODIAC_SIGNS } from "@/constants/zodiac";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Start (month 1-12, day) of each sign, parsed from ZODIAC_SIGNS[].dates ("Mar 21 – Apr 19"). */
const STARTS = ZODIAC_SIGNS.map((s) => {
  const [mon, day] = s.dates.split("–")[0].trim().split(" ");
  return { slug: s.slug, month: MONTHS.indexOf(mon) + 1, day: Number(day) };
});

/** Classical element and traditional ruling planet per sign (Aries…Pisces). */
export const SIGN_ELEMENTS = ["fire", "earth", "air", "water"];
const RULERS = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];

/** Western (tropical) sun sign for a "YYYY-MM-DD" date of birth. */
export function findSunSign(dateStr) {
  const [, m, d] = dateStr.split("-").map(Number);
  if (!m || !d) return null;
  const key = m * 100 + d;
  // The sign whose start is the latest one on or before the date; before Jan 20 wraps to Capricorn.
  let idx = STARTS.length - 1;
  let best = -1;
  STARTS.forEach((s, i) => {
    const k = s.month * 100 + s.day;
    if (k <= key && k > best) {
      best = k;
      idx = i;
    }
  });
  if (best === -1) idx = STARTS.findIndex((s) => s.slug === "capricorn");
  const sign = ZODIAC_SIGNS[idx];
  return { ...sign, index: idx, element: SIGN_ELEMENTS[idx % 4], ruler: RULERS[idx] };
}
