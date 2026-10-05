import { Inter, Marcellus, Noto_Sans_Devanagari, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { siteConfig } from "@/config/site";
import { hasLocale, locales } from "@/config/locale";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
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

export async function generateMetadata() {
  const { verification } = siteConfig;
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: `${siteConfig.name} – ${"Talk to Verified Astrologers Online – Chat & Video Call"}`, template: `%s | ${siteConfig.name}` },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "astrology",
    formatDetection: { telephone: false },
    // Pages without their own Open Graph data still get a branded preview when shared.
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: "en_IN",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: { card: "summary_large_image", images: [siteConfig.ogImage] },
    // Large image previews and full snippets in Google results.
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    verification: {
      ...(verification.google ? { google: verification.google } : {}),
      ...(verification.bing ? { other: { "msvalidate.01": verification.bing } } : {}),
    },
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
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
