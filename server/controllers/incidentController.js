const db = require("../config/firebase");
const { analyzeIncident } = require("../services/triage");
const { findNearbyStations } = require("../services/stationLookup");
const { departmentsForIncident } = require("../utils/departments");
const { isValidCoordinates, cleanText } = require("../utils/validation");
const { geoHash, geoQuery, queueIncidentNotifications, processNotificationJobs } =
  require("../services/notifications");

function parseMediaUrls(raw) {
  if (!Array.isArray(raw) || raw.length > 5) return null;
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const media = [];
  for (const item of raw) {
    if (!item || typeof item.url !== "string" ||
        !["image", "video"].includes(item.type)) return null;
    let url;
    try { url = new URL(item.url); } catch { return null; }
    if (!cloud || url.protocol !== "https:" ||
        url.hostname !== "res.cloudinary.com" ||
        !url.pathname.startsWith("/" + cloud + "/" + item.type + "/upload/")) {
      return null;
    }
    media.push({ url: url.toString(), type: item.type });
  }
  return media;
}

async function createReport(req, res) {
  try {
    const type = cleanText(req.body.type, 80);
    const description = cleanText(req.body.description, 2000);
    const location = cleanText(req.body.location, 150) || "Location provided on map";
    const { latitude, longitude } = req.body;
    const mediaUrls = parseMediaUrls(req.body.mediaUrls || []);
    if (!type || description.length < 10 || !isValidCoordinates(latitude, longitude) ||
        mediaUrls === null) {
      return res.status(400).json({
        error: "Provide an incident type, a description (10+ characters), valid GPS coordinates, and valid media.",
      });
    }

    const triage = await analyzeIncident({ type, description, mediaUrls });
    const departments = departmentsForIncident(type, triage.department);
    let lookup = { stations: [], source: "unavailable" };
    try {
      lookup = await findNearbyStations(departments, latitude, longitude);
    } catch (error) {
      console.warn("Station suggestions unavailable:", error.message);
    }

    const reportRef = db.collection("reports").doc();
    const timestamp = db.admin.firestore.FieldValue.serverTimestamp();
    const report = {
      type, description, location, mediaUrls,
      latitude: Number(latitude), longitude: Number(longitude),
      geohash: geoHash(latitude, longitude),
      severity: triage.severity,
      department: triage.department,
      triageStatus: triage.triageStatus,
      aiConfidence: triage.confidence,
      status: "PENDING",
      verifiedYes: 0, verifiedNo: 0, verifiedUnsure: 0,
      createdBy: req.auth.uid,
      createdAt: timestamp, updatedAt: timestamp,
    };

    const batch = db.batch();
    batch.create(reportRef, report);
    for (const department of departments) {
      const key = department.toLowerCase().replace(/[^a-z]+/g, "_");
      batch.create(db.collection("incident_distributions").doc(reportRef.id + "_" + key), {
        reportId: reportRef.id,
        responderType: department,
        stations: lookup.stations.filter((s) => s.type === department),
        latitude: Number(latitude), longitude: Number(longitude),
        type, severity: triage.severity, location,
        status: "PENDING", acknowledgedBy: [],
        createdAt: timestamp, updatedAt: timestamp,
      });
    }
    queueIncidentNotifications(batch, reportRef);
    await batch.commit();
    res.status(201).json({
      success: true, reportId: reportRef.id,
      triage, departments,
      nearbyStations: lookup.stations,
      stationSource: lookup.source,
      dispatchStatus: "DEMO_ONLY",
      message: "Report saved. Suggested facilities have not been contacted.",
    });
    // Attempt immediate delivery without delaying the reporter; the durable
    // outbox and scheduled worker retry if the process exits or delivery fails.
    setImmediate(() => processNotificationJobs().catch((error) =>
      console.warn("Immediate notification processing deferred:", error.message)
    ));
  } catch (error) {
    console.error("Report submission failed:", error);
    res.status(500).json({ error: "Could not save your report. Please retry." });
  }
}

async function getNearbyIncidents(req, res) {
  if (!isValidCoordinates(req.body.latitude, req.body.longitude)) {
    return res.status(400).json({ error: "Valid latitude and longitude are required." });
  }
  try {
    const reports = await geoQuery(
      "reports", Number(req.body.latitude), Number(req.body.longitude), 5
    );
    const active = reports.filter((r) => !["RESOLVED", "REJECTED", "ARCHIVED"].includes(r.status));
    active.sort((a, b) => (b.createdAt?.toMillis?.() || 0) -
      (a.createdAt?.toMillis?.() || 0));
    res.json({ incidents: active.slice(0, 50) });
  } catch (error) {
    console.error("Nearby report query failed:", error);
    res.status(500).json({ error: "Nearby incidents are temporarily unavailable." });
  }
}

async function deleteReport(req, res) {
  const id = req.params.id;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
    return res.status(400).json({ error: "Invalid report identifier." });
  }
  const ref = db.collection("reports").doc(id);
  const related = await db.collection("incident_distributions")
    .where("reportId", "==", id).get();
  const batch = db.batch();
  batch.update(ref, {
    status: "ARCHIVED",
    archivedAt: db.admin.firestore.FieldValue.serverTimestamp(),
    archivedBy: req.auth.uid,
  });
  for (const distribution of related.docs) {
    batch.update(distribution.ref, {
      status: "ARCHIVED",
      updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  res.json({ success: true });
}

module.exports = { createReport, getNearbyIncidents, deleteReport };
