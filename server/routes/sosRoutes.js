const express = require("express");

const router = express.Router();

const {
    sendSOS,
} = require(
    "../controllers/sosController"
);

router.post(
    "/send-sos",
    sendSOS
);

module.exports = router;