const express =
    require("express");

const router =
    express.Router();

const {

    getResponderIncidents,
    deployIncident,
    resolveIncident,

} = require(
    "../controllers/responderController"
);

/* Get incidents */
router.get(

    "/responder-incidents/:type",

    getResponderIncidents

);

/* Deploy */
router.put(

    "/deploy-incident/:id",

    deployIncident

);

/* Resolve */
router.put(

    "/resolve-incident/:id",

    resolveIncident

);

module.exports = router;