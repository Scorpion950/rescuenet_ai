/* Browser push handler. No Firebase secrets are embedded in this worker. */
self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { /* ignore */ }
  const notification = payload.notification || payload.data?.notification || {};
  const title = notification.title || "RescueNet nearby alert";
  const body = notification.body || "Open the live map for incident details.";
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "/logo.png",
    data: { url: "/livemap" },
    tag: payload.data?.reportId || "rescuenet-incident",
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || "/livemap"));
});
