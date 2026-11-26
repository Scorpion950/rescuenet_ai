const express = require("express");
const db = require("../config/firebase");
const { civilianAuth } = require("../middleware/authMiddleware");
const { geoHash, notifyOnEntry } = require("../services/notifications");
const { isValidCoordinates, cleanText } = require("../utils/validation");

const router = express.Router();
router.use(civilianAuth);

router.get("/profile", async (req, res) => {
  const snap = await db.collection("users").doc(req.auth.uid).get();
  res.json({ profile: snap.data() || { alertsEnabled: false } });
});

router.post("/profile", async (req, res) => {
  const ref = db.collection("users").doc(req.auth.uid);
  const safe = {
    name: cleanText(req.body.name, 100),
    email: cleanText(req.body.email, 160),
    updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
  };
  await ref.set(safe, { merge: true });
  res.json({ success: true });
});

router.put("/profile/preferences", async (req, res) => {
  if (typeof req.body.alertsEnabled !== "boolean") {
    return res.status(400).json({ error: "alertsEnabled must be true or false." });
  }
  const enabled = req.body.alertsEnabled;
  const payload = {
    alertsEnabled: enabled,
    updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
    ...(enabled ? {
      alertsConsentAt: db.admin.firestore.FieldValue.serverTimestamp(),
    } : {
      latitude: db.admin.firestore.FieldValue.delete(),
      longitude: db.admin.firestore.FieldValue.delete(),
      geohash: db.admin.firestore.FieldValue.delete(),
      locationUpdatedAt: db.admin.firestore.FieldValue.delete(),
      pushToken: db.admin.firestore.FieldValue.delete(),
    }),
  };
  await db.collection("users").doc(req.auth.uid).set(payload, { merge: true });
  res.json({ success: true, alertsEnabled: enabled });
});

router.post("/profile/location", async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!isValidCoordinates(latitude, longitude)) {
    return res.status(400).json({ error: "Valid location coordinates required." });
  }
  const ref = db.collection("users").doc(req.auth.uid);
  const profile = await ref.get();
  if (profile.data()?.alertsEnabled !== true) {
    return res.status(403).json({ error: "Enable nearby alerts before sharing location." });
  }
  await ref.set({
    latitude: Number(latitude),
    longitude: Number(longitude),
    geohash: geoHash(latitude, longitude),
    locationUpdatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  const newAlerts = await notifyOnEntry(req.auth.uid, Number(latitude), Number(longitude));
  res.json({ success: true, newAlerts });
});

router.post("/notifications/subscribe", async (req, res) => {
  const token = req.body.token;
  if (typeof token !== "string" || token.length < 20 || token.length > 2048) {
    return res.status(400).json({ error: "Invalid push subscription." });
  }
  const ref = db.collection("users").doc(req.auth.uid);
  const profile = await ref.get();
  if (profile.data()?.alertsEnabled !== true) {
    return res.status(403).json({ error: "Enable nearby alerts first." });
  }
  await ref.set({ pushToken: token }, { merge: true });
  res.json({ success: true });
});

router.post("/notifications/:id/read", async (req, res) => {
  await db.collection("notifications").doc(req.auth.uid).collection("items")
    .doc(req.params.id).update({ read: true });
  res.json({ success: true });
});

module.exports = router;
