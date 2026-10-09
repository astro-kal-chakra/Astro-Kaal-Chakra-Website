"use client";

import { useMemo } from "react";
import { routes } from "@/config/routes";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AstrologerCard } from "@/features/astrologers/components/AstrologerCard";
import { useAstrologerPresence } from "@/features/astrologers/hooks/useAstrologerPresence";

const isAvailable = (a) => a.status === "online" || a.status === "busy";

function Row({ astrologers }) {
  return (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:pb-0 grid-cols-1 md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
      {astrologers.map((a) => (
        <div key={a.id} className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-auto">
          <AstrologerCard astrologer={a} />
        </div>
      ))}
    </div>
  );
}

/**
 * Home: "Online now" (only while someone is online or busy) + "Our astrologers" (always).
 * Presence is live over the socket, so astrologers join / leave the online row without a reload.
 * @param {{ online: object[], all: object[] }} props server-rendered lists (online now, top astrologers)
 */
export function HomeAstrologers({ online, all }) {
  const everyone = useMemo(() => {
    const seen = new Set();
    return [...online, ...all].filter((a) => (seen.has(a.id) ? false : seen.add(a.id)));
  }, [online, all]);
  const withPresence = useAstrologerPresence(everyone);
  const current = everyone.map(withPresence);
  const onlineNow = current.filter(isAvailable).slice(0, 6);
  const byId = Object.fromEntries(current.map((a) => [a.id, a]));
  const top = all.map((a) => byId[a.id]);

  return (
    <>
      {onlineNow.length > 0 && (
        <section className="container-page pb-4 pt-8 sm:pb-6 sm:pt-10" aria-live="polite">
          <SectionHeading
            eyebrow="Online now"
            title="Astrologers online now"
            subtitle="Start in seconds. Busy? Join the waitlist and we'll offer you the next slot."
            action={{ href: `${routes.astrologers}?online=1`, label: "View all online" }}
          />
          <Row astrologers={onlineNow} />
        </section>
      )}
      {top.length > 0 && (
        <section className="container-page pb-4 pt-8 sm:pb-6 sm:pt-10">
          <SectionHeading
            eyebrow="Top rated"
            title="Our astrologers"
            subtitle="Verified Vedic astrologers. Follow your favourites to know when they come online or go live."
            action={{ href: routes.astrologers, label: "View all" }}
          />
          <Row astrologers={top} />
        </section>
      )}
    </>
  );
}
