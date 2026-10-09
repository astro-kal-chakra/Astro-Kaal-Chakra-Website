import { CelestialBackdrop } from "@/components/ui/CelestialBackdrop";
import { ParticleField } from "@/components/ui/ParticleField";

/**
 * Horoscope index + every sign page: the turning zodiac wheel with orbiting planets behind the content,
 * plus the night-sky starfield in dark mode.
 */
export default function HoroscopeLayout({ children }) {
  return (
    // isolate: keeps the -z-10 backgrounds above the page background but behind this content
    <div className="relative isolate">
      <CelestialBackdrop />
      <ParticleField darkOnly />
      {children}
    </div>
  );
}
