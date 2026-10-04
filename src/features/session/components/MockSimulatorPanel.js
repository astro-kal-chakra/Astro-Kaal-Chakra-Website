"use client";

import { FlaskConical } from "lucide-react";
import { env } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import { mockSessionEngine } from "../lib/mockSessionEngine";
import { label as t } from "@/lib/labels";

/**
 * QA controls for the mock engine (only rendered while running on mocks).
 * Lets testers trigger the states that are hard to reach by hand.
 */
export function MockSimulatorPanel({ sessionId, isFree, className }) {
  if (!env.useMocks) return null;
  const dev = mockSessionEngine.dev;
  const actions = [
    { key: "drop", run: () => dev.dropConnection(5000) },
    { key: "lowBalance", run: () => dev.drainBalance(sessionId) },
    isFree && { key: "skipFree", run: () => dev.skipFreeTime(sessionId) },
    { key: "astrologerEnds", run: () => dev.endByAstrologer(sessionId) },
    { key: "adminEnds", run: () => dev.endByAdmin(sessionId) },
    { key: "expireLogin", run: () => dev.expireLogin() },
    { key: "signInElsewhere", run: () => dev.signInElsewhere() },
  ].filter(Boolean);

  return (
    <details className={cn("group fixed left-2 z-30 text-xs", className)}>
      <summary
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full border border-dashed border-brand-400 bg-surface/90 text-brand-600 shadow backdrop-blur dark:text-gold-400 [&::-webkit-details-marker]:hidden"
        aria-label="Mock simulator"
        title="Mock simulator"
      >
        <FlaskConical className="size-4" aria-hidden />
      </summary>
      <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-line bg-surface p-2 text-fg shadow-xl">
        <p className="px-2 pb-1 font-semibold text-muted">Mock simulator</p>
        <ul>
          {actions.map((a) => (
            <li key={a.key}>
              <button
                type="button"
                onClick={a.run}
                className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-surface-muted"
              >
                {t(`session.dev.${a.key}`)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
