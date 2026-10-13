import { routes } from "@/config/routes";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiveSessionCard } from "@/features/live/components/LiveSessionCard";

/**
 * Home "Live now": astrologers streaming right now.
 * Renders nothing when no one is live — the section only exists while a session is on air.
 */
export function LiveNowSection({ sessions }) {
  if (!sessions?.length) return null;
  const items = sessions.slice(0, 8);
  const count = items.length;

  return (
    <section className="container-page py-4 sm:py-6" aria-label="Live now">
      <SectionHeading
        eyebrow="Live now"
        title={
          <span className="inline-flex items-start gap-3">
            <span className="relative mt-[0.45em] flex size-3 shrink-0" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-red-600" />
            </span>
            Astrologers live right now
          </span>
        }
        subtitle={`${count} live ${count === 1 ? "session" : "sessions"} on air. Watch free, chat with others and ask your question.`}
        action={{ href: routes.live, label: "View all" }}
      />
      {/* One session: a plain card. Several: swipeable carousel on phones/tablets; on desktop a grid for up to 3, carousel beyond. */}
      {count > 1 && (
        <CardCarousel label="Live sessions" slideClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3" delay={3500} className={count > 3 ? undefined : "lg:hidden"}>
          {items.map((s) => (
            <LiveSessionCard key={s.id} session={s} />
          ))}
        </CardCarousel>
      )}
      {count <= 3 && (
        <ul className={count === 1 ? "grid max-w-md grid-cols-1" : "hidden grid-cols-3 gap-5 lg:grid"}>
          {items.map((s) => (
            <li key={s.id}>
              <LiveSessionCard session={s} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
