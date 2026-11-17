"use client";

import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { CurrencyProvider } from "@/features/international/components/CurrencyProvider";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { ReferralCapture } from "@/features/referral/components/ReferralCapture";
import { DevToolsGuard } from "@/components/layout/DevToolsGuard";
import { SocketProvider } from "./SocketProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";

/**
 * All client-side context in one place, mounted once in the root layout.
 * `international`: the dashboard's international settings (site config); off → rupees everywhere as before.
 */
export function AppProviders({ children, international }) {
  return (
    <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CurrencyProvider international={international}>
              <SocketProvider>
                {children}
                <LoginModal />
                <ReferralCapture />
                <DevToolsGuard />
              </SocketProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ToastProvider>
    </ThemeProvider>
  );
}
