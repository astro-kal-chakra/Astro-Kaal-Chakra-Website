"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "../context/AuthProvider";
import { LoginForm } from "./LoginForm";

/** Global login modal opened by requireAuth() — keeps the user on the page they were browsing. */
export function LoginModal() {
  const router = useRouter();
  const { loginPrompt, closeLoginPrompt } = useAuth();

  const handleSuccess = ({ isNewUser }) => {
    const action = loginPrompt?.onSuccess;
    closeLoginPrompt();
    if (isNewUser) {
      router.push(`${routes.onboarding}?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    action?.();
  };

  return (
    <Modal open={Boolean(loginPrompt)} onClose={closeLoginPrompt} title="Please log in to continue">
      <p className="mb-5 text-sm text-muted">Browse freely — we only ask you to log in when you chat, call, recharge or save something.</p>
      {loginPrompt && <LoginForm onSuccess={handleSuccess} />}
    </Modal>
  );
}
