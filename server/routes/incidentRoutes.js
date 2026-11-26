const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { createReport, getNearbyIncidents, deleteReport } =
  require("../controllers/incidentController");
const { civilianAuth, adminAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/reports", civilianAuth, rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 8,
  keyGenerator: (req) => req.auth.uid,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "You've submitted too many reports. Please wait before retrying." },
}), createReport);
router.post("/nearby-incidents", getNearbyIncidents);
router.delete("/reports/:id", adminAuth, deleteReport);
module.exports = router;
