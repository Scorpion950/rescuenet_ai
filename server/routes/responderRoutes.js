const express =
    require("express");

const router =
    express.Router();

const {

    responderAuth,

} = require(

    "../middleware/authMiddleware"

);

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

    responderAuth,

    getResponderIncidents

);

/* Deploy incident */
router.put(

    "/deploy-incident/:id",

    responderAuth,

    deployIncident

);

/* Resolve incident */
router.put(

    "/resolve-incident/:id",

    responderAuth,

    resolveIncident

);

module.exports = router;