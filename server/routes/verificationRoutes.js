const express = require("express");
const { civilianAuth } = require("../middleware/authMiddleware");
const { verifyIncident } = require("../controllers/verificationController");
const router = express.Router();
router.post("/verify-incident", civilianAuth, verifyIncident);
module.exports = router;
