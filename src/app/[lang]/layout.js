import { Inter, Marcellus, Noto_Sans_Devanagari, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { siteConfig } from "@/config/site";
import { hasLocale, locales } from "@/config/locale";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { AppProviders } from "@/providers/AppProviders";
import { themeInitScript } from "@/providers/ThemeProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { GoogleTranslate } from "@/features/translate/components/GoogleTranslate";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-devanagari", display: "swap" });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets env(safe-area-inset-*) work on notched iPhones (bottom sheets, sticky bars).
  viewportFit: "cover",
  // Android Chrome: shrink the layout when the keyboard opens so bottom sheets stay visible.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0804" },
  ],
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: `${siteConfig.name} – ${"Talk to Verified Astrologers Online – Chat & Video Call"}`, template: `%s | ${siteConfig.name}` },
    description: "Chat or video call with verified Vedic astrologers for love, career, marriage, finance and health. Free first chat. Daily horoscope, free Kundli and Panchang.",
    applicationName: siteConfig.name,
    formatDetection: { telephone: false },
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${devanagari.variable} ${marcellus.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        {/* Applies saved/system theme before first paint (no light→dark flash). */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <AppProviders>
          <OfflineBanner />
          {children}
        </AppProviders>
        <GoogleTranslate />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
