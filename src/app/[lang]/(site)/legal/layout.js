import { CelestialBackdrop } from "@/components/ui/CelestialBackdrop";
import { ParticleField } from "@/components/ui/ParticleField";

/**
 * Every legal page (privacy, terms, refund, disclaimer): the same turning zodiac wheel with orbiting
 * planets as the horoscope pages, plus the night-sky starfield in dark mode.
 */
export default function LegalLayout({ children }) {
  return (
    // isolate: keeps the -z-10 backgrounds above the page background but behind this content
    <div className="relative isolate">
      {/* fainter than on the horoscope pages: legal pages are long paragraphs, readability first */}
      <CelestialBackdrop className="opacity-55" />
      <ParticleField darkOnly />
      {children}
    </div>
  );
}
