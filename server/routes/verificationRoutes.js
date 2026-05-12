const express = require("express");

const router = express.Router();

const {
    verifyIncident,
} = require(
    "../controllers/verificationController"
);

router.post(
    "/verify-incident",
    verifyIncident
);

module.exports = router;