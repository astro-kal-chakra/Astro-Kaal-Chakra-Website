"use client";

import { createContext, useCallback, useContext, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { AUTH_HINT_COOKIE } from "@/config/site";
import { authService } from "@/lib/api/services/auth.service";
import { getSocket, reconnectSocket } from "@/lib/socket/client";
import { disableWebPush, enableWebPush } from "@/lib/push/webPush";
import { SIGNED_IN_ELSEWHERE, SOCKET_EVENTS } from "@/lib/socket/events";
import { useToast } from "@/providers/ToastProvider";

const AuthContext = createContext(null);

/** Shown as a toast and on the login page after a sign-in on another device. */
export const SIGNED_IN_ELSEWHERE_MESSAGE = "You signed in on another device, so you were signed out here.";

const setHintCookie = (on) => {
  document.cookie = on
    ? `${AUTH_HINT_COOKIE}=1; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`
    : `${AUTH_HINT_COOKIE}=; Path=/; Max-Age=0`;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | guest
  const [loginPrompt, setLoginPrompt] = useState(null); // { reason, onSuccess }
  const router = useRouter();
  const { toast } = useToast();
  const signedOutHandled = useRef(false); // socket + HTTP can both report the same sign-out

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

  /**
   * One signed-in device per account: when the account signs in elsewhere the
   * backend answers 401 SIGNED_IN_ELSEWHERE (see lib/api/http.js) and sends
   * `auth:signed_out { reason: "signed_in_elsewhere" }` over the socket.
   * Sign out locally and explain why on the login page.
   */
  const onSignedOut = useEffectEvent((reason) => {
    if (reason !== SIGNED_IN_ELSEWHERE || signedOutHandled.current) return;
    signedOutHandled.current = true;
    authService.clearLocal();
    disableWebPush().catch(() => {}); // this browser no longer belongs to the account
    // Clear this browser's (already revoked) cookies, then continue as a guest
    authService.logout().catch(() => {}).finally(reconnectSocket);
    setUser(null);
    setStatus("guest");
    setHintCookie(false);
    setLoginPrompt(null);
    toast({ type: "warning", title: SIGNED_IN_ELSEWHERE_MESSAGE, duration: 8000 });
    router.replace(`${routes.login}?reason=${SIGNED_IN_ELSEWHERE}`);
  });

  useEffect(() => {
    const onWindow = (e) => onSignedOut(e.detail?.reason);
    const onSocket = (p) => onSignedOut(p?.reason);
    window.addEventListener("auth:signed_out", onWindow);
    const socket = getSocket(); // null on mocks — the mock simulator dispatches the window event instead
    socket?.on(SOCKET_EVENTS.AUTH_SIGNED_OUT, onSocket);
    return () => {
      window.removeEventListener("auth:signed_out", onWindow);
      socket?.off(SOCKET_EVENTS.AUTH_SIGNED_OUT, onSocket);
    };
  }, []);

  const onLoggedIn = useCallback((u) => {
    signedOutHandled.current = false;
    setUser(u);
    setStatus("authenticated");
    setHintCookie(true);
    reconnectSocket(); // pick up the new login cookie
  }, []);

  // Signed in and notifications already allowed: (re)attach this browser's push subscription to the account
  useEffect(() => {
    if (status === "authenticated") enableWebPush().catch(() => {});
  }, [status]);

  const logout = useCallback(async (opts) => {
    await disableWebPush().catch(() => {}); // while still signed in, so the backend forgets this browser
    await authService.logout(opts).catch(() => {});
    reconnectSocket(); // continue as a guest
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
