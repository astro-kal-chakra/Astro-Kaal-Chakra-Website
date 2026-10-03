import { env } from "@/config/site";
import { http, mockDelay } from "../http";

const MOCK_CITIES = [
  ["Delhi", "Delhi", 28.61, 77.21], ["Mumbai", "Maharashtra", 19.08, 72.88], ["Bengaluru", "Karnataka", 12.97, 77.59],
  ["Kolkata", "West Bengal", 22.57, 88.36], ["Chennai", "Tamil Nadu", 13.08, 80.27], ["Hyderabad", "Telangana", 17.39, 78.49],
  ["Pune", "Maharashtra", 18.52, 73.86], ["Ahmedabad", "Gujarat", 23.02, 72.57], ["Jaipur", "Rajasthan", 26.91, 75.79],
  ["Lucknow", "Uttar Pradesh", 26.85, 80.95], ["Varanasi", "Uttar Pradesh", 25.32, 82.97], ["Patna", "Bihar", 25.59, 85.14],
  ["Bhopal", "Madhya Pradesh", 23.26, 77.41], ["Indore", "Madhya Pradesh", 22.72, 75.86], ["Chandigarh", "Chandigarh", 30.73, 76.78],
  ["Kochi", "Kerala", 9.93, 76.27], ["Nagpur", "Maharashtra", 21.15, 79.09], ["Surat", "Gujarat", 21.17, 72.83],
  ["Guwahati", "Assam", 26.14, 91.74], ["Dehradun", "Uttarakhand", 30.32, 78.03],
].map(([name, state, lat, lng]) => ({ id: name.toLowerCase(), name, region: `${state}, India`, lat, lng, timezone: "Asia/Kolkata" }));

export const placesService = {
  /** Place search for birth location. Backend should proxy a geocoder and return lat/lng + timezone. */
  async search(q) {
    if (!q || q.length < 2) return [];
    if (env.useMocks) {
      const s = q.toLowerCase();
      return mockDelay(MOCK_CITIES.filter((c) => c.name.toLowerCase().startsWith(s)).slice(0, 6), 120);
    }
    return http("/places/search", { query: { q } });
  },
};
