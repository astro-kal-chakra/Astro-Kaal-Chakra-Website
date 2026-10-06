import { env } from "@/config/site";
import { http, mockDelay } from "../http";
import { mockKundli, mockMatching, mockPanchang } from "../mock/astro-tools";

/**
 * Free astrology tools. All calculations happen on the backend (Swiss Ephemeris);
 * in mock mode we return deterministic approximations from ../mock/astro-tools.
 *
 * Shapes use language-neutral indexes/keys (translated in the UI via `tools.names.*`):
 *  - sign: 0-11 (Aries…Pisces), nakshatra: 0-26 (Ashwini…Revati), planet: "sun" | "moon" | … | "ketu"
 *  - dates: "YYYY-MM-DD", instants: ISO-8601 strings
 *
 * BirthInput: { name, gender, date: "YYYY-MM-DD", time: "HH:MM", place: { name, region, lat, lng, timezone } }
 */
const delay = typeof window === "undefined" ? 0 : 450;

export const astroToolsService = {
  /**
   * @param {object} input BirthInput
   * @returns {Promise<{ basic: object, planets: object[], dasha: object[], input: object, isMock?: boolean }>}
   */
  async generateKundli(input) {
    if (env.useMocks) return mockDelay(mockKundli(input), delay);
    return http("/tools/kundli", { method: "POST", body: input });
  },

  /**
   * Ashtakoot Guna Milan + Manglik for two people.
   * @returns {Promise<{ boy: object, girl: object, kootas: object[], total: number, max: number }>}
   */
  async matchKundli({ boy, girl }) {
    if (env.useMocks) return mockDelay(mockMatching({ boy, girl }), delay);
    return http("/tools/kundli-matching", { method: "POST", body: { boy, girl } });
  },

  /**
   * @param {{ date: string, place: { lat: number, lng: number, timezone?: string } }} p
   * @returns {Promise<object>} tithi, nakshatra, yoga, karana, vaar, sun/moon times, Rahu Kaal…
   */
  async getPanchang({ date, place }) {
    if (env.useMocks) return mockDelay(mockPanchang({ date, place }), delay);
    return http("/tools/panchang", {
      query: { date, lat: place.lat, lng: place.lng, tz: place.timezone, name: place.name, region: place.region },
      next: { revalidate: 3600 },
    });
  },

  /** Save a kundli to the logged-in user's account (requires auth). */
  async saveKundli(input) {
    if (env.useMocks) return mockDelay({ id: `kundli_${Date.now()}`, saved: true }, delay);
    return http("/me/kundlis", { method: "POST", body: input });
  },

  /** Ask the backend to render a PDF. Returns a signed download URL (null in mock mode). */
  async downloadKundliPdf(input) {
    if (env.useMocks) return mockDelay({ url: null }, delay);
    return http("/tools/kundli/pdf", { method: "POST", body: input });
  },
};
