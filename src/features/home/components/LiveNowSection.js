"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { liveService } from "@/lib/api/services/live.service";
import { getSocket } from "@/lib/socket/client";
import { Reveal } from "@/components/ui/Reveal";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiveSessionCard } from "@/features/live/components/LiveSessionCard";

const POLL_MS = 20_000;

/**
 * Home "Live now": astrologers streaming right now.
 * Renders nothing when no one is live — the section only exists while a session is on air.
 * The server-rendered list can be cached (and the browser keeps visited pages), so it refreshes itself:
 * on open, when a live starts or ends (socket), when the tab comes back into view, and every 20 s while
 * visible. No hard refresh needed.
 */
export function LiveNowSection({ sessions: initial = [] }) {
  const [sessions, setSessions] = useState(initial);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const r = await liveService.list(SITE_LOCALE);
      setSessions(Array.isArray(r?.live) ? r.live : []);
    } catch {
      /* keep what is shown */
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    // Right after the page shows (the cached list may already be out of date)
    const first = setTimeout(refresh, 0);
    const tick = setInterval(
      () => document.visibilityState === "visible" && refresh(),
      POLL_MS,
    );
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    // live:started / live:ended reach pages watching astrologer status (the astrologer list on this page)
    const socket = getSocket();
    let soon;
    const onChange = () => {
      clearTimeout(soon);
      soon = setTimeout(refresh, 800); // the list endpoint may need a moment to include / drop the room
    };
    socket?.on("live:started", onChange);
    socket?.on("live:ended", onChange);
    return () => {
      clearTimeout(first);
      clearInterval(tick);
      clearTimeout(soon);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      socket?.off("live:started", onChange);
      socket?.off("live:ended", onChange);
    };
  }, [refresh]);

  if (!sessions?.length) return null;
  const items = sessions.slice(0, 8);
  const count = items.length;

  return (
    <Reveal>
      <section className="container-page py-4 sm:py-6" aria-label="Live now">
        <SectionHeading
          eyebrow="Live now"
          title={
            <span className="inline-flex items-start gap-3">
              <span
                className="relative mt-[0.45em] flex size-3 shrink-0"
                aria-hidden
              >
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-red-600" />
              </span>
              Astrologers live right now
            </span>
          }
          subtitle={`${count} live ${count === 1 ? "session" : "sessions"} on air. Watch free, chat with others and ask your question.`}
          action={{ href: routes.live, label: "View all live sessions" }}
        />
        {/* One session: a plain card. Several: swipeable carousel on phones/tablets; on desktop a grid for up to 3, carousel beyond. */}
        {count > 1 && (
          <CardCarousel
            label="Live sessions"
            slideClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3"
            delay={3500}
            className={count > 3 ? undefined : "lg:hidden"}
          >
            {items.map((s) => (
              <LiveSessionCard key={s.id} session={s} />
            ))}
          </CardCarousel>
        )}
        {count <= 3 && (
          <ul
            className={
              count === 1
                ? "grid max-w-md grid-cols-1"
                : "hidden grid-cols-3 gap-5 lg:grid"
            }
          >
            {items.map((s) => (
              <li key={s.id}>
                <LiveSessionCard session={s} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}
