import { routes } from "@/config/routes";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiveSessionCard } from "@/features/live/components/LiveSessionCard";

/** Home: astrologers broadcasting right now. Rendered only when at least one live session is on. */
export function HomeLiveNow({ sessions }) {
  if (!sessions?.length) return null;
  return (
    <section className="container-page pb-4 pt-8 sm:pb-6 sm:pt-10">
      <SectionHeading eyebrow="Live now" title="Live sessions" subtitle="Watch for free, ask questions and send blessings in real time." action={{ href: routes.live, label: "All live sessions" }} />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.slice(0, 3).map((s) => (
          <li key={s.id}>
            <LiveSessionCard session={s} />
          </li>
        ))}
      </ul>
    </section>
  );
}
