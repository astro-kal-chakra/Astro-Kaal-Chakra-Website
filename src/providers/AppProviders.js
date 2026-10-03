"use client";

import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { SocketProvider } from "./SocketProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";

/** All client-side context in one place, mounted once in the root layout. */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
              <LoginModal />
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
    </ThemeProvider>
  );
}
