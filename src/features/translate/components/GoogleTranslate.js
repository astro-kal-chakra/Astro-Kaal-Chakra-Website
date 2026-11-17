"use client";

import { useLayoutEffect } from "react";
import { PAGE_LANGUAGE } from "../config";
import { getCurrentLanguage, installDomGuard, loadTranslate } from "../lib/googleTranslate";

if (typeof window !== "undefined") installDomGuard();

/**
 * Host for the Google Website Translator. The widget itself is kept off-screen; <LanguageToggle /> is the
 * visible, brand-styled control. Mounted once in the root layout.
 *
 * The translator script (~110 KB) is NOT loaded for everyone: only for visitors who already picked another
 * language (their page must translate on load), otherwise when someone reaches for the language switch
 * (see LanguageToggle / setLanguage). Keeps it out of PageSpeed's "unused JavaScript" for most visits.
 */
export function GoogleTranslate() {
  // Layout effect: runs before the first paint, so a returning Hindi reader's page starts translating as early as possible.
  useLayoutEffect(() => {
    if (getCurrentLanguage() !== PAGE_LANGUAGE) loadTranslate();
  }, []);

  // `inert`: the hidden widget's <select> can't be focused (it's aria-hidden). Script changes to it still work.
  return <div id="google_translate_element" className="google-translate-host" aria-hidden inert />;
}
