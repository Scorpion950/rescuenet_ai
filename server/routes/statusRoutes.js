const express =
    require("express");

const router =
    express.Router();

const {

    adminAuth,

} = require(

    "../middleware/authMiddleware"

);

const {

    updateIncidentStatus,

} = require(

    "../controllers/statusController"

);

/* Protected Admin Status Update */
router.post(

    "/incident/status",

    adminAuth,

    updateIncidentStatus

);

module.exports = router;