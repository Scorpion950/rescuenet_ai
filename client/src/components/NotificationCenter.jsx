import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, MapPin, ShieldCheck, X } from "lucide-react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { apiFetch } from "../services/api";
import { useCivilianSession } from "../context/CivilianSessionContext";
import { useLocation } from "../context/LocationContext";
import useNotifications from "../hooks/useNotifications";

export default function NotificationCenter() {
  const { ready } = useCivilianSession();
  const { userLocation, requestLocation, stopTracking, isTracking } = useLocation();
  const notifications = useNotifications();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const lastSync = useRef({ time: 0, coords: null });

  useEffect(() => {
    if (!ready) return;
    apiFetch("/profile").then((data) =>
      setEnabled(data.profile?.alertsEnabled === true)
    ).catch(() => {});
  }, [ready]);

  useEffect(() => {
    if (!ready || !enabled || !userLocation) return;
    const last = lastSync.current;
    const now = Date.now();
    const moved = !last.coords ||
      Math.abs(last.coords[0] - userLocation[0]) > 0.001 ||
      Math.abs(last.coords[1] - userLocation[1]) > 0.001;
    if (now - last.time < 60000 && !moved) return;
    lastSync.current = { time: now, coords: userLocation };
    apiFetch("/profile/location", {
      method: "POST",
      body: { latitude: userLocation[0], longitude: userLocation[1] },
    }).catch(() => setFeedback("Location sync failed. We'll retry after you move."));
  }, [ready, enabled, userLocation]);

  async function toggleAlerts() {
    setBusy(true);
    setFeedback("");
    try {
      const next = !enabled;
      await apiFetch("/profile/preferences", {
        method: "PUT", body: { alertsEnabled: next },
      });
      setEnabled(next);
      if (next) {
        await requestLocation({ watch: true });
        setFeedback("Nearby alerts enabled while your location is available.");
      } else {
        stopTracking();
        setFeedback("Nearby alerts disabled. Stored location removed.");
      }
    } catch (error) {
      setFeedback(error.message || "Could not update alert preferences.");
    } finally {
      setBusy(false);
    }
  }

  async function enablePush() {
    setBusy(true);
    try {
      if (!(await isSupported())) throw new Error("Push is unavailable in this browser.");
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) throw new Error("Push isn't configured yet. In-app alerts still work.");
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Notification permission was not granted.");
      }
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const token = await getToken(getMessaging(), { vapidKey, serviceWorkerRegistration: registration });
      if (!token) throw new Error("Couldn't create a push subscription.");
      await apiFetch("/notifications/subscribe", { method: "POST", body: { token } });
      setFeedback("Browser push notifications enabled.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setBusy(false);
    }
  }

  const unread = notifications.filter((item) => !item.read).length;
  if (!ready) return null;
  return (
    <div className="notification-center">
      <button
        className="icon-button notification-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={unread ? "Notifications, " + unread + " unread" : "Notifications"}
        aria-expanded={open}
      >
        {unread ? <BellRing size={20} /> : <Bell size={20} />}
        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </button>
      {open && (
        <div className="notification-popover" role="region" aria-label="Nearby alerts">
          <div className="notification-topline">
            <div>
              <strong>Nearby alerts</strong>
              <p>Warnings for places around you</p>
            </div>
            <button className="icon-button" aria-label="Close notifications" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="notification-preferences">
            <button className="preference-row" disabled={busy} onClick={toggleAlerts}>
              <MapPin size={19} />
              <span>{enabled ? "Turn off nearby alerts" : "Enable nearby alerts"}</span>
              <span className={"status-pill " + (enabled ? "status-on" : "")}>
                {enabled ? "On" : "Off"}
              </span>
            </button>
            {enabled && (
              <button className="preference-row" disabled={busy || isTracking}
                onClick={() => requestLocation({ watch: true })
                  .then(() => setFeedback("Location alerts active for this browser session."))
                  .catch((issue) => setFeedback(issue.message))}>
                <MapPin size={19} />
                <span>{isTracking ? "Location updates running" : "Start location updates for this session"}</span>
              </button>
            )}
            {enabled && (
              <button className="preference-row" disabled={busy} onClick={enablePush}>
                <ShieldCheck size={19} />
                <span>Enable browser push</span>
              </button>
            )}
            {feedback && <p className="notification-feedback">{feedback}</p>}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="notification-empty">No notifications yet. We'll show nearby reports here.</p>
            ) : notifications.map((item) => (
              <button
                key={item.id}
                className={"notification-item " + (!item.read ? "is-unread" : "")}
                onClick={async () => {
                  try {
                    await apiFetch("/notifications/" + item.id + "/read", { method: "POST" });
                  } catch { /* Keep item visible; retry on next click */ }
                  window.location.href = "/livemap";
                }}
              >
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </button>
            ))}
          </div>
          <p className="notification-footnote">Website location tracking only runs while active.</p>
        </div>
      )}
    </div>
  );
}
