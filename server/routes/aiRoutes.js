const express = require("express");

const router = express.Router();
const { civilianAuth } = require("../middleware/authMiddleware");

const {
    analyzeReport,
} = require(
    "../controllers/aiController"
);

router.post(
    "/analyze-report",
    civilianAuth,
    analyzeReport
);

module.exports = router;
