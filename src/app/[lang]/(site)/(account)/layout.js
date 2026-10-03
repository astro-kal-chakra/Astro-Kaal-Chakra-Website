import { AuthGuard } from "@/features/auth/components/AuthGuard";

/** Logged-in area: never indexed, client-rendered behind an auth guard. */
export const metadata = { robots: { index: false, follow: false } };

export default function AccountLayout({ children }) {
  return (
    <div className="container-page py-8">
      <AuthGuard>{children}</AuthGuard>
    </div>
  );
}
