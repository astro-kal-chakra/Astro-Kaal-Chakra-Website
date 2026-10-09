import { env } from "@/config/site";
import { http, mockDelay } from "../http";
import { mockStore } from "../mock/account";
import { MOCK_NOTIFICATION_PREFS, MOCK_NOTIFICATIONS } from "../mock/account-notifications";

export const NOTIFICATION_TYPES = ["follow_online", "queue_turn", "payment_success", "offer", "daily_horoscope"];
/** Preference categories × channels. `locked` channels are transactional and always on. */
export const NOTIFICATION_CATEGORIES = ["sessions", "follows", "payments", "offers", "horoscope"];
export const NOTIFICATION_CHANNELS = ["push", "sms", "email"];
export const LOCKED_PREFERENCES = { payments: ["sms"] };

const notificationsStore = mockStore("notifications", MOCK_NOTIFICATIONS);
const prefsStore = mockStore("notificationPrefs", MOCK_NOTIFICATION_PREFS);

/** Fired after any read/unread change so the bell and the list stay in sync. */
export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";
const emitChange = () => typeof window !== "undefined" && window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));

const localise = (n, locale) => {
  const { en, hi, ...rest } = n;
  const [title, body] = (locale === "hi" ? hi : en) || en;
  return { ...rest, title, body };
};

export const notificationService = {
  /** Server localises title/body by `lang`. */
  async list({ locale = "en", limit } = {}) {
    if (env.useMocks) {
      const items = notificationsStore
        .get()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((n) => localise(n, locale));
      return mockDelay({
        items: limit ? items.slice(0, limit) : items,
        unreadCount: items.filter((n) => !n.read).length,
      });
    }
    return http("/me/notifications", { query: { lang: locale, limit } });
  },

  async markRead(id) {
    if (env.useMocks) {
      notificationsStore.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
      emitChange();
      return mockDelay(null, 80);
    }
    const res = await http(`/me/notifications/${id}/read`, { method: "POST" });
    emitChange();
    return res;
  },

  async markAllRead() {
    if (env.useMocks) {
      notificationsStore.update((list) => list.map((n) => ({ ...n, read: true })));
      emitChange();
      return mockDelay(null, 150);
    }
    const res = await http("/me/notifications/read-all", { method: "POST" });
    emitChange();
    return res;
  },

  /** { [category]: { push, sms, email } } */
  async getPreferences() {
    if (env.useMocks) return mockDelay(prefsStore.get());
    return http("/me/notification-preferences");
  },

  async updatePreference(category, channel, enabled) {
    if (env.useMocks) {
      return mockDelay(
        prefsStore.update((p) => ({ ...p, [category]: { ...p[category], [channel]: enabled } })),
        150
      );
    }
    return http("/me/notification-preferences", { method: "PATCH", body: { category, channel, enabled } });
  },

  /** Save this browser's Web Push subscription ({ endpoint, keys: { p256dh, auth } }) for the signed-in user. */
  async savePushSubscription(subscription) {
    if (env.useMocks) return mockDelay({ subscribed: true });
    return http("/me/push-subscriptions", { method: "POST", body: subscription });
  },

  /** Forget this browser's subscription (logout / turned off). */
  async removePushSubscription(endpoint) {
    if (env.useMocks) return mockDelay({ subscribed: false });
    return http("/me/push-subscriptions", { method: "DELETE", body: { endpoint } });
  },
};
