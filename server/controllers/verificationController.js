const db = require("../config/firebase");

async function verifyIncident(req, res) {
  const { reportId, voteType } = req.body;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(reportId || "") ||
      !["yes", "no", "unsure"].includes(voteType)) {
    return res.status(400).json({ error: "Valid report and vote are required." });
  }
  const ref = db.collection("reports").doc(reportId);
  const voteRef = ref.collection("votes").doc(req.auth.uid);
  try {
    const result = await db.runTransaction(async (tx) => {
      const [reportDoc, existingVote] = await Promise.all([
        tx.get(ref), tx.get(voteRef),
      ]);
      if (!reportDoc.exists) return { error: "Report not found.", code: 404 };
      const report = reportDoc.data();
      if (["RESOLVED", "ARCHIVED", "REJECTED"].includes(report.status)) {
        return { error: "Voting has closed for this report.", code: 409 };
      }
      if (report.createdBy === req.auth.uid) {
        return { error: "You cannot verify your own report.", code: 403 };
      }
      const previous = existingVote.data()?.voteType;
      if (previous === voteType) return { unchanged: true };
      const counts = {
        yes: Number(report.verifiedYes || 0),
        no: Number(report.verifiedNo || 0),
        unsure: Number(report.verifiedUnsure || 0),
      };
      if (previous && counts[previous] > 0) counts[previous]--;
      counts[voteType]++;
      let status = report.status;
      if (!["DEPLOYED", "IN_PROGRESS"].includes(status)) {
        if (counts.yes >= 3 && counts.yes > counts.no) status = "VERIFIED";
        else if (counts.no > counts.yes + 5) status = "NEEDS_REVIEW";
        else status = "PENDING";
      }
      tx.set(voteRef, {
        voteType,
        updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
      });
      tx.update(ref, {
        verifiedYes: counts.yes,
        verifiedNo: counts.no,
        verifiedUnsure: counts.unsure,
        status,
        updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
      });
      return { counts, status };
    });
    if (result.error) return res.status(result.code).json({ error: result.error });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Vote transaction failed:", error);
    res.status(500).json({ error: "Could not save vote." });
  }
}

module.exports = { verifyIncident };
