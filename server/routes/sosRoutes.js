const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { sendSOS } = require("../controllers/sosController");
const { civilianAuth } = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/send-sos", civilianAuth, rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 4,
  keyGenerator: (req) => req.auth.uid,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many SOS requests. Contact official emergency services for urgent help." },
}), sendSOS);
module.exports = router;
