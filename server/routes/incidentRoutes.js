const express = require("express");

const router = express.Router();

const {
    getNearbyIncidents,
} = require(
    "../controllers/incidentController"
);

router.post(
    "/nearby-incidents",
    getNearbyIncidents
);

module.exports = router;