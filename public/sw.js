/* Astro-Kaal-Chakra service worker: browser push notifications only (no offline caching). */

const DEFAULT_TITLE = "Astro-Kaal-Chakra";

// Payload from the backend (services/webPush.service.js): { title, body, url, tag, image }
self.addEventListener("push", (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch {
    d = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(d.title || DEFAULT_TITLE, {
      body: d.body || "",
      icon: "/images/icon-192.png",
      badge: "/images/icon-192.png",
      image: d.image || undefined,
      tag: d.tag || undefined,
      renotify: Boolean(d.tag),
      data: { url: typeof d.url === "string" && d.url.startsWith("/") && !d.url.startsWith("//") ? d.url : "/" },
    })
  );
});

// Open the linked page: reuse an open tab of the site when there is one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((tabs) => {
      const tab = tabs.find((c) => c.url.startsWith(self.location.origin));
      if (tab) return tab.navigate(url).then((c) => (c || tab).focus());
      return self.clients.openWindow(url);
    })
  );
});
