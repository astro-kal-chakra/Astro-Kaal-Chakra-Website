import { Suspense } from "react";
import { LoginView } from "@/features/auth/components/LoginView";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: "Login" };
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}
