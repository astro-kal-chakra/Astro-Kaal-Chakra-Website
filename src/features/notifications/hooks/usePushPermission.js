"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "push-permission:change";

const subscribe = (cb) => {
  window.addEventListener(EVENT, cb);
  let status = null;
  navigator.permissions
    ?.query({ name: "notifications" })
    .then((s) => {
      status = s;
      s.addEventListener("change", cb);
    })
    .catch(() => {});
  return () => {
    window.removeEventListener(EVENT, cb);
    status?.removeEventListener("change", cb);
  };
};

/** "granted" | "denied" | "default" | "unsupported" (client) — "unknown" during SSR/hydration. */
const getPermission = () => (typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported");
const getServerPermission = () => "unknown";

const noopSubscribe = () => () => {};
/** iOS Safari supports web push only for Home Screen web apps (iOS 16.4+). */
const getPlatform = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIOS) return "other";
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
  return standalone ? "ios-standalone" : "ios-browser";
};
const getServerPlatform = () => "other";

/**
 * Browser notification permission + a `request()` that asks for it.
 * `needsHomeScreen` is true on iPhone/iPad Safari when not installed to the Home Screen.
 */
export function usePushPermission() {
  const permission = useSyncExternalStore(subscribe, getPermission, getServerPermission);
  const platform = useSyncExternalStore(noopSubscribe, getPlatform, getServerPlatform);

  const request = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported";
    let result;
    try {
      result = await Notification.requestPermission();
    } catch {
      result = Notification.permission;
    }
    window.dispatchEvent(new Event(EVENT));
    // TODO(push): obtain an FCM token (getToken with the VAPID key) and register it with
    // notificationService.registerPushToken(token). Nothing is sent until there is a real token.
    return result;
  }, []);

  return {
    permission,
    request,
    isIOS: platform !== "other",
    needsHomeScreen: platform === "ios-browser",
  };
}
