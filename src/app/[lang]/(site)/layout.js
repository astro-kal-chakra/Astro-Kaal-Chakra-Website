import { CookieConsent } from "@/components/layout/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmartAppBanner } from "@/components/layout/SmartAppBanner";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { contentService } from "@/lib/api/services/content.service";

/** Standard chrome for all browseable pages: header, footer, app banner. */
export default async function SiteLayout({ children, params }) {
  const { lang } = await params;
  const config = await contentService.getSiteConfig(); // app links & support contacts from the dashboard settings
  return (
    <>
      <SmartAppBanner appLinks={config.appLinks} />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer locale={lang} config={config} />
      <WhatsAppButton />
      <CookieConsent />
    </>
  );
}
