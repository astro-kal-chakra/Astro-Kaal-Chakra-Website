/** Login & onboarding are never indexed. */
export const metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }) {
  return <div className="container-page flex justify-center py-10 sm:py-16">{children}</div>;
}
