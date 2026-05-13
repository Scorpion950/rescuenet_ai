const express =
    require("express");

const router =
    express.Router();

const {

    updateIncidentStatus,

} = require(

    "../controllers/statusController"

);

router.post(

    "/incident/status",

    updateIncidentStatus

);

module.exports = router;