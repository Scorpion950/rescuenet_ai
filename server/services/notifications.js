const db = require("../config/firebase");
const { geohashQueryBounds, geohashForLocation } = require("geofire-common");
const calculateDistance = require("../utils/distanceCalculator");
const { isValidCoordinates } = require("../utils/validation");

const ALERT_RADIUS_KM = 5;
const ACTIVE_STATUSES = new Set(["PENDING", "VERIFIED", "VERIFIED & LIVE",
  "NOT SURE", "NEEDS_REVIEW", "DEPLOYED", "IN_PROGRESS"]);

function geoHash(latitude, longitude) {
  return geohashForLocation([Number(latitude), Number(longitude)]);
}

async function geoQuery(collectionName, latitude, longitude, radiusKm = ALERT_RADIUS_KM) {
  const bounds = geohashQueryBounds(
    [Number(latitude), Number(longitude)], radiusKm * 1000
  );
  const snapshots = await Promise.all(bounds.map(([start, end]) =>
    db.collection(collectionName).orderBy("geohash")
      .startAt(start).endAt(end).limit(500).get()
  ));
  const matches = new Map();
  snapshots.forEach((snapshot) => snapshot.forEach((doc) => {
    const data = doc.data();
    if (isValidCoordinates(data.latitude, data.longitude) &&
        calculateDistance(latitude, longitude, data.latitude, data.longitude) <= radiusKm) {
      matches.set(doc.id, { id: doc.id, ...data });
    }
  }));
  return [...matches.values()];
}

async function sendPush(user, notification) {
  if (process.env.ENABLE_PUSH_DELIVERY !== "true" || !user.pushToken) return;
  try {
    await db.admin.messaging().send({
      token: user.pushToken,
      notification: { title: notification.title, body: notification.body },
      webpush: {
        fcmOptions: {
          link: new URL("/livemap", (process.env.FRONTEND_URL || "https://rescuenet-ai.netlify.app").split(",")[0]).href,
        },
      },
      data: { reportId: String(notification.reportId || "") },
    });
  } catch (error) {
    console.warn("Push delivery failed:", error.code || error.message);
  }
}

async function createUserNotification(uid, report, user, kind = "NEARBY_INCIDENT") {
  const ref = db.collection("notifications").doc(uid)
    .collection("items").doc("incident_" + report.id);
  const notification = {
    kind,
    reportId: report.id,
    title: report.severity === "CRITICAL" ? "Critical incident nearby" : "Incident reported nearby",
    body: [report.type, report.location].filter(Boolean).join(" near ").slice(0, 220),
    severity: report.severity,
    latitude: report.latitude,
    longitude: report.longitude,
    read: false,
    createdAt: db.admin.firestore.FieldValue.serverTimestamp(),
  };
  try {
    await ref.create(notification);
    await sendPush(user, notification);
    return true;
  } catch (error) {
    if (error.code === 6 || error.code === "already-exists") return false;
    throw error;
  }
}

async function notifyNewIncident(report) {
  const users = await geoQuery("users", report.latitude, report.longitude);
  let notified = 0;
  for (const user of users) {
    if (user.alertsEnabled !== true) continue;
    const lastUpdated = user.locationUpdatedAt?.toMillis?.() || 0;
    if (Date.now() - lastUpdated > 24 * 60 * 60 * 1000) continue;
    if (await createUserNotification(user.id, report, user)) notified++;
  }
  return notified;
}

async function notifyOnEntry(uid, latitude, longitude) {
  const userDoc = await db.collection("users").doc(uid).get();
  const user = userDoc.data();
  if (!user || user.alertsEnabled !== true) return 0;
  const reports = await geoQuery("reports", latitude, longitude);
  let count = 0;
  for (const report of reports) {
    if (ACTIVE_STATUSES.has(report.status) &&
        await createUserNotification(uid, report, user, "ENTERED_DANGER_AREA")) count++;
  }
  return count;
}

function queueIncidentNotifications(batch, reportRef) {
  const jobRef = db.collection("notification_jobs").doc(reportRef.id);
  batch.create(jobRef, {
    reportId: reportRef.id,
    status: "PENDING",
    attempts: 0,
    createdAt: db.admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function processNotificationJobs() {
  // A crashed worker must not leave jobs in PROCESSING forever.
  const abandoned = await db.collection("notification_jobs")
    .where("status", "==", "PROCESSING").limit(20).get();
  for (const job of abandoned.docs) {
    const claimed = job.data().claimedAt?.toMillis?.() || 0;
    if (Date.now() - claimed > 10 * 60 * 1000) {
      await job.ref.update({
        status: (job.data().attempts || 0) >= 3 ? "FAILED" : "PENDING",
      });
    }
  }
  const snapshot = await db.collection("notification_jobs")
    .where("status", "==", "PENDING").limit(15).get();
  for (const job of snapshot.docs) {
    const claimed = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(job.ref);
      if (fresh.data()?.status !== "PENDING") return false;
      tx.update(job.ref, {
        status: "PROCESSING",
        attempts: db.admin.firestore.FieldValue.increment(1),
        claimedAt: db.admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    });
    if (!claimed) continue;
    try {
      const report = await db.collection("reports").doc(job.id).get();
      if (report.exists) await notifyNewIncident({ id: report.id, ...report.data() });
      await job.ref.update({
        status: "COMPLETED",
        completedAt: db.admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Notification job failed:", error.message);
      await job.ref.update({
        status: (job.data().attempts || 0) >= 2 ? "FAILED" : "PENDING",
        error: String(error.message).slice(0, 200),
      });
    }
  }
}

module.exports = {
  ALERT_RADIUS_KM, geoHash, geoQuery, notifyOnEntry,
  queueIncidentNotifications, processNotificationJobs,
};
