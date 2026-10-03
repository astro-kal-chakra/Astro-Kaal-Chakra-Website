import { CalendarDays, Hash, HeartHandshake, ScrollText, Sparkles } from "lucide-react";
import { routes } from "@/config/routes";

/** Every free tool — used by ToolsNav for internal linking. `key` maps to tools.nav.<key>. */
export const TOOLS = [
  { key: "kundli", href: routes.kundli, icon: ScrollText },
  { key: "kundliMatching", href: routes.kundliMatching, icon: HeartHandshake },
  { key: "panchang", href: routes.panchang, icon: CalendarDays },
  { key: "zodiacFinder", href: routes.zodiacFinder, icon: Sparkles },
  { key: "numerology", href: routes.numerology, icon: Hash },
];

/** Default Panchang location until the user picks a city (same shape as placesService results). */
export const DEFAULT_CITY = {
  id: "delhi",
  name: "Delhi",
  region: "Delhi, India",
  lat: 28.61,
  lng: 77.21,
  timezone: "Asia/Kolkata",
};

export const EMPTY_BIRTH = { name: "", gender: "", date: "", time: "", place: null };
