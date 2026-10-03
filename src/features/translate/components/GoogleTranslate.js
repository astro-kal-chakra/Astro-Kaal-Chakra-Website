"use client";

import { useEffect } from "react";
import { PAGE_LANGUAGE, TRANSLATE_LANGUAGES } from "../config";
import { installDomGuard } from "../lib/googleTranslate";

if (typeof window !== "undefined") installDomGuard();

/**
 * Loads the Google Website Translator once per page load. The widget itself is
 * kept off-screen; <LanguageToggle /> is the visible, brand-styled control.
 * Mounted once in the root layout.
 */
export function GoogleTranslate() {
  useEffect(() => {
    if (window.google?.translate || document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: PAGE_LANGUAGE,
          includedLanguages: TRANSLATE_LANGUAGES.map((l) => l.code).join(","),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
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
