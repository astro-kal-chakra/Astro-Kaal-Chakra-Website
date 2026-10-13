import { env } from "@/config/site";
import { contentService } from "@/lib/api/services/content.service";
import { notificationService } from "@/lib/api/services/notification.service";

/**
 * Browser push (standard Web Push). The backend sends to the subscription saved here; public/sw.js shows it.
 * Works in Chrome, Edge, Firefox and Safari 16.4+ (on iPhone only when added to the Home Screen).
 */
export const webPushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const toKey = (base64url) => {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

async function registration() {
  return (await navigator.serviceWorker.getRegistration("/")) || navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

/**
 * Subscribes this browser and saves it for the signed-in user. Needs notification permission already granted.
 * Safe to call repeatedly (e.g. after every login): the backend replaces the same endpoint.
 * @returns {Promise<boolean>} true when the browser will receive push
 */
export async function enableWebPush() {
  if (env.useMocks || !webPushSupported() || Notification.permission !== "granted") return false;
  const { webPush } = await contentService.getSiteConfig();
  if (!webPush?.publicKey) return false;
  const reg = await registration();
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  // A subscription made with another server key can't be used: replace it
  const key = toKey(webPush.publicKey);
  const current = sub?.options?.applicationServerKey && new Uint8Array(sub.options.applicationServerKey);
  if (sub && current && (current.length !== key.length || current.some((b, i) => b !== key[i]))) {
    await sub.unsubscribe();
    sub = null;
  }
  sub ||= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const json = sub.toJSON();
  await notificationService.savePushSubscription({ endpoint: json.endpoint, keys: json.keys });
  return true;
}

/** On logout: stop pushes for this account in this browser (the next person to sign in gets their own). */
export async function disableWebPush() {
  if (env.useMocks || !webPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await notificationService.removePushSubscription(sub.endpoint).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}
