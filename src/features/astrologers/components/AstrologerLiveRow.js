"use client";

import { useAstrologerPresence } from "../hooks/useAstrologerPresence";
import { AstrologerCard } from "./AstrologerCard";

/** Horizontally scrollable row of live astrologer cards (home page, similar astrologers). */
export function AstrologerLiveRow({ astrologers }) {
  const withPresence = useAstrologerPresence(astrologers);
  return (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid grid-cols-1 md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
      {astrologers.map((a) => (
        <div key={a.id} className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-auto">
          <AstrologerCard astrologer={withPresence(a)} />
        </div>
      ))}
    </div>
  );
}
