const express = require("express");

const router = express.Router();

const {
    getNearbyIncidents,
    distributeIncidentToResponders,
} = require(
    "../controllers/incidentController"
);

router.post(
    "/nearby-incidents",
    getNearbyIncidents
);

router.post(
    "/distribute-incident",
    distributeIncidentToResponders
);

module.exports = router;