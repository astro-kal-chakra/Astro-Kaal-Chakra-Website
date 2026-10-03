import { SessionAuthGate } from "@/features/session/components/SessionAuthGate";

/**
 * Full-screen layout for live chat / call sessions: no footer, no app banner,
 * never indexed. Header is session-specific and lives in each page.
 */
export const metadata = { robots: { index: false, follow: false } };

/** Android Chrome: resize the layout (not just the visual viewport) when the keyboard opens. */
export const viewport = { interactiveWidget: "resizes-content" };

export default function SessionLayout({ children }) {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-bg">
      <SessionAuthGate>{children}</SessionAuthGate>
    </main>
  );
}
