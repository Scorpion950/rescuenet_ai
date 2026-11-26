const crypto = require("node:crypto");
const db = require("../config/firebase");
const { findNearbyStations } = require("../services/stationLookup");
const { normalizeDepartments } = require("../utils/departments");
const { isValidCoordinates, cleanText } = require("../utils/validation");

async function sendSOS(req, res) {
  const services = normalizeDepartments(req.body.services);
  const { latitude, longitude } = req.body;
  if (!services.length || !isValidCoordinates(latitude, longitude)) {
    return res.status(400).json({ error: "Select a service and provide valid coordinates." });
  }
  const requestKey = cleanText(req.body.requestKey, 100);
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(requestKey)) {
    return res.status(400).json({ error: "A unique request key is required." });
  }

  try {
    const key = crypto.createHash("sha256")
      .update(req.auth.uid + ":" + requestKey).digest("hex").slice(0, 40);
    const ref = db.collection("sosAlerts").doc(key);
    const existing = await ref.get();
    if (existing.exists) {
      return res.json({
        success: true, alertId: key, duplicate: true,
        status: existing.data().status,
        suggestedStations: existing.data().suggestedStations || [],
      });
    }

    const lookup = await findNearbyStations(services, latitude, longitude);
    const payload = {
      services,
      latitude: Number(latitude),
      longitude: Number(longitude),
      location: cleanText(req.body.location, 160) || "GPS location",
      createdBy: req.auth.uid,
      status: "PENDING",
      dispatchStatus: "DEMO_ONLY",
      suggestedStations: lookup.stations,
      stationSource: lookup.source,
      createdAt: db.admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
    };
    try { await ref.create(payload); } catch (error) {
      if (error.code !== 6 && error.code !== "already-exists") throw error;
    }
    res.status(201).json({
      success: true,
      alertId: key,
      status: "PENDING",
      suggestedStations: lookup.stations,
      assignedStations: lookup.stations,
      dispatchStatus: "DEMO_ONLY",
      message: "SOS saved in RescueNet demo. No emergency service has been contacted.",
    });
  } catch (error) {
    console.error("SOS creation failed:", error);
    res.status(500).json({ error: "Could not save SOS. Retry or contact emergency services directly." });
  }
}

module.exports = { sendSOS };
