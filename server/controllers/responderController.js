const db = require("../config/firebase");
const { normalizeDepartment } = require("../utils/departments");

function canAccessDepartment(req, type) {
  return req.auth.role === "admin" || req.auth.department === type;
}

async function getResponderIncidents(req, res) {
  const type = normalizeDepartment(req.params.type);
  if (!type || !canAccessDepartment(req, type)) {
    return res.status(403).json({ error: "You cannot view this department's requests." });
  }
  try {
    const [sos, distributions] = await Promise.all([
      db.collection("sosAlerts").where("services", "array-contains", type).limit(100).get(),
      db.collection("incident_distributions").where("responderType", "==", type)
        .limit(100).get(),
    ]);
    const incidents = [
      ...sos.docs.map((doc) => ({ id: doc.id, source: "sos", ...doc.data() })),
      ...distributions.docs.map((doc) => ({ id: doc.id, source: "incident", ...doc.data() })),
    ].filter((item) => !["RESOLVED", "ARCHIVED", "REJECTED"].includes(item.status));
    incidents.sort((a, b) => (b.createdAt?.toMillis?.() || 0) -
      (a.createdAt?.toMillis?.() || 0));
    res.json({ success: true, incidents });
  } catch (error) {
    console.error("Responder queue failed:", error);
    res.status(500).json({ error: "Could not load responder queue." });
  }
}

function referenceFor(req) {
  const source = req.body.source;
  if (!["sos", "incident"].includes(source)) return null;
  return db.collection(source === "sos" ? "sosAlerts" : "incident_distributions")
    .doc(req.params.id);
}

async function updateResponderStatus(req, res, status) {
  const ref = referenceFor(req);
  if (!ref) return res.status(400).json({ error: "A valid incident source is required." });
  try {
    const updated = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return { error: "Request not found.", code: 404 };
      const item = snap.data();
      const matches = req.body.source === "sos"
        ? item.services?.includes(req.auth.department)
        : item.responderType === req.auth.department;
      if (req.auth.role !== "admin" && !matches) {
        return { error: "This request is not assigned to your department.", code: 403 };
      }
      if (["RESOLVED", "ARCHIVED", "REJECTED"].includes(item.status)) {
        return { error: "This request is already closed.", code: 409 };
      }
      tx.update(ref, {
        status,
        updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
        ...(status === "DEPLOYED" ? {
          acknowledgedBy: db.admin.firestore.FieldValue.arrayUnion(req.auth.uid),
          deployedAt: db.admin.firestore.FieldValue.serverTimestamp(),
        } : {
          resolvedBy: req.auth.uid,
          resolvedAt: db.admin.firestore.FieldValue.serverTimestamp(),
        }),
      });
      return { reportId: item.reportId || null };
    });
    if (updated.error) return res.status(updated.code).json({ error: updated.error });

    if (status === "RESOLVED" && updated.reportId) {
      const distributions = await db.collection("incident_distributions")
        .where("reportId", "==", updated.reportId).get();
      const allResolved = distributions.docs.every((item) =>
        item.id === req.params.id || item.data().status === "RESOLVED"
      );
      if (allResolved) {
        const reportRef = db.collection("reports").doc(updated.reportId);
        const currentReport = await reportRef.get();
        if (currentReport.exists &&
            !["ARCHIVED", "REJECTED"].includes(currentReport.data().status)) {
          await reportRef.update({
            status: "RESOLVED",
            resolvedAt: db.admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }
    res.json({ success: true, status });
  } catch (error) {
    console.error("Responder status update failed:", error);
    res.status(500).json({ error: "Could not update request." });
  }
}

const deployIncident = (req, res) => updateResponderStatus(req, res, "DEPLOYED");
const resolveIncident = (req, res) => updateResponderStatus(req, res, "RESOLVED");
module.exports = { getResponderIncidents, deployIncident, resolveIncident };
