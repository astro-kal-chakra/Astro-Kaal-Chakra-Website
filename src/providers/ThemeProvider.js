"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

const ThemeContext = createContext(null);
export const THEME_STORAGE_KEY = "theme";
const THEME_EVENT = "theme:change";

/**
 * Inline script for <head> — applies the saved/system theme before paint
 * so there's no light→dark flash.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

const subscribe = (cb) => {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
};
const getSnapshot = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");
const getServerSnapshot = () => "light";

export function ThemeProvider({ children }) {
  // Fallback for pages where the beforeInteractive init script isn't emitted (e.g. 404).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      if (dark !== document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.toggle("dark", dark);
        window.dispatchEvent(new Event(THEME_EVENT));
      }
    } catch {}
  }, []);

  // The <html> class (set by themeInitScript) is the source of truth.
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next = getSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
