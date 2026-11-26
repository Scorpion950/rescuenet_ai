const cron = require("node-cron");
const db = require("../config/firebase");
const { processNotificationJobs } = require("../services/notifications");

let busy = false;
function startAutoResolveJob() {
  cron.schedule("* * * * *", async () => {
    if (busy) return;
    busy = true;
    try {
      await processNotificationJobs();
      // Stale reports need human review. They must never be automatically
      // labeled RESOLVED just because 30 minutes have elapsed.
      const cutoff = db.admin.firestore.Timestamp.fromMillis(
        Date.now() - 24 * 60 * 60 * 1000
      );
      const oldPending = await db.collection("reports")
        .where("status", "==", "PENDING")
        .where("createdAt", "<=", cutoff).limit(50).get();
      for (const item of oldPending.docs) {
        await item.ref.update({
          status: "NEEDS_REVIEW",
          reviewReason: "No confirmation after 24 hours",
          updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Background job failed:", error);
    } finally {
      busy = false;
    }
  });
}

module.exports = { startAutoResolveJob };
