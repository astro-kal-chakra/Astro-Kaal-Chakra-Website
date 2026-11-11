import { CookieConsent } from "@/components/layout/CookieConsent";
import { AcademyHeader } from "@/features/academy/components/AcademyHeader";

/** Academy course pages and the enrolment → plan → payment → success steps: no site menu or footer (course header on the course page only). */
export default function AcademyLayout({ children }) {
  return (
    <>
      <AcademyHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <CookieConsent />
    </>
  );
}
