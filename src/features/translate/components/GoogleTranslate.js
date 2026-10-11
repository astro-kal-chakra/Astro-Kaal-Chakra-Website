"use client";

import { useLayoutEffect } from "react";
import { preconnect } from "react-dom";
import { PAGE_LANGUAGE, TRANSLATE_LANGUAGES } from "../config";
import { installDomGuard } from "../lib/googleTranslate";

if (typeof window !== "undefined") installDomGuard();

/**
 * Loads the Google Website Translator once per page load. The widget itself is
 * kept off-screen; <LanguageToggle /> is the visible, brand-styled control.
 * Mounted once in the root layout.
 */
export function GoogleTranslate() {
  // Open connections to Google's translator early, so the script and the first translation start faster.
  preconnect("https://translate.google.com");
  preconnect("https://translate.googleapis.com");
  preconnect("https://translate-pa.googleapis.com");

  // Layout effect: runs before the first paint (a frame earlier than useEffect), so the translator
  // script starts loading as soon as possible. It only adds a <script> tag, so it never delays painting.
  useLayoutEffect(() => {
    if (window.google?.translate || document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: PAGE_LANGUAGE,
          includedLanguages: TRANSLATE_LANGUAGES.map((l) => l.code).join(","),
          autoDisplay: false,
          // Default layout on purpose: it renders the <select class="goog-te-combo"> that setLanguage() drives.
          // (The SIMPLE layout has no select, so every switch fell back to a full page reload.)
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element" className="google-translate-host" aria-hidden />;
}
