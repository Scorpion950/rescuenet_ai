const express = require("express");
const router = express.Router();

const { sendNearbyAlerts } = require("../controllers/nearbyAlertsController");

router.post("/send-nearby-alerts", sendNearbyAlerts);

module.exports = router;
