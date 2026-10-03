"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_HINT_COOKIE } from "@/config/site";
import { authService } from "@/lib/api/services/auth.service";
import { disconnectSocket } from "@/lib/socket/client";

const AuthContext = createContext(null);

const setHintCookie = (on) => {
  document.cookie = on
    ? `${AUTH_HINT_COOKIE}=1; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`
    : `${AUTH_HINT_COOKIE}=; Path=/; Max-Age=0`;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | guest
  const [loginPrompt, setLoginPrompt] = useState(null); // { reason, onSuccess }

  const applyUser = useCallback((me) => {
    setUser(me);
    setStatus(me ? "authenticated" : "guest");
    setHintCookie(Boolean(me));
  }, []);

  const refresh = useCallback(
    () =>
      authService
        .me()
        .then(applyUser)
        .catch(() => setStatus("guest")),
    [applyUser]
  );

  useEffect(() => {
    authService
      .me()
      .then(applyUser)
      .catch(() => setStatus("guest"));
    const onExpired = () => {
      setUser(null);
      setStatus("guest");
      setHintCookie(false);
      setLoginPrompt({ reason: "expired" });
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [applyUser]);

  const onLoggedIn = useCallback((u) => {
    setUser(u);
    setStatus("authenticated");
    setHintCookie(true);
  }, []);

  const logout = useCallback(async (opts) => {
    await authService.logout(opts).catch(() => {});
    disconnectSocket();
    setUser(null);
    setStatus("guest");
    setHintCookie(false);
  }, []);

  /**
   * Run `action` if logged in, otherwise open the login modal and run it after login.
   * Use for chat / call / recharge / save — never to gate plain browsing.
   */
  const requireAuth = useCallback(
    (action, reason = "action") => {
      if (status === "authenticated") return action?.();
      setLoginPrompt({ reason, onSuccess: action });
    },
    [status]
  );

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      refresh,
      onLoggedIn,
      logout,
      requireAuth,
      loginPrompt,
      closeLoginPrompt: () => setLoginPrompt(null),
      setUser,
    }),
    [user, status, refresh, onLoggedIn, logout, requireAuth, loginPrompt]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
