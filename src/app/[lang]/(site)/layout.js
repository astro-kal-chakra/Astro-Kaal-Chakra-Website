import { CookieConsent } from "@/components/layout/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmartAppBanner } from "@/components/layout/SmartAppBanner";

/** Standard chrome for all browseable pages: header, footer, app banner. */
export default async function SiteLayout({ children, params }) {
  const { lang } = await params;
  return (
    <>
      <SmartAppBanner />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer locale={lang} />
      <CookieConsent />
    </>
  );
}
