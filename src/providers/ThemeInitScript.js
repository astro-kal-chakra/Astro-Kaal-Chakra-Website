"use client";

import { themeInitScript } from "./ThemeProvider";

/**
 * Applies the saved/system theme before first paint (no light→dark flash).
 * Executable only in the server HTML; when React renders it on the client (e.g. after an
 * error or not-found re-render) it is an inert `text/plain` block, so React doesn't warn
 * about a script that would never run. The theme is already applied by then.
 */
export function ThemeInitScript() {
  return (
    <script
      id="theme-init"
      suppressHydrationWarning
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
