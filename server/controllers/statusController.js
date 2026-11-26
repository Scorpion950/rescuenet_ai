const db = require("../config/firebase");

async function updateIncidentStatus(req, res) {
  const { incidentId, status, source = "sos" } = req.body;
  if (!["PENDING", "VERIFIED", "DEPLOYED", "IN_PROGRESS", "RESOLVED",
    "NEEDS_REVIEW", "REJECTED"].includes(status) ||
    !["sos", "report"].includes(source) ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(incidentId || "")) {
    return res.status(400).json({ error: "Invalid incident status update." });
  }
  try {
    const ref = db.collection(source === "sos" ? "sosAlerts" : "reports")
      .doc(incidentId);
    const batch = db.batch();
    batch.update(ref, {
        status,
        updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: req.auth.uid,
      });
    if (source === "report" && ["RESOLVED", "REJECTED"].includes(status)) {
      const assigned = await db.collection("incident_distributions")
        .where("reportId", "==", incidentId).get();
      for (const distribution of assigned.docs) {
        batch.update(distribution.ref, {
          status,
          updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
    await batch.commit();
    res.json({ success: true, status });
  } catch (error) {
    console.error("Admin incident update failed:", error);
    res.status(500).json({ error: "Could not update incident." });
  }
}

async function archiveSOS(req, res) {
  try {
    await db.collection("sosAlerts").doc(req.params.id).update({
      status: "ARCHIVED",
      archivedBy: req.auth.uid,
      archivedAt: db.admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Could not archive SOS." });
  }
}

module.exports = { updateIncidentStatus, archiveSOS };
