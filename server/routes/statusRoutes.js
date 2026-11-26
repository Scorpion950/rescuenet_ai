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
    archiveSOS,

} = require(

    "../controllers/statusController"

);

/* Protected Admin Status Update */
router.post(

    "/incident/status",

    adminAuth,

    updateIncidentStatus

);

router.delete("/sos/:id", adminAuth, archiveSOS);

module.exports = router;
