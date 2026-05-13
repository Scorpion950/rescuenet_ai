const db =
    require("../config/firebase");

/* Get incidents for responder */
const getResponderIncidents =

    async (req, res) => {

        try {

            const {
                type,
            } = req.params;

            // Fetch SOS alerts
            const snapshot =

                await db
                    .collection("sosAlerts")
                    .get();

            const incidents = [];

            snapshot.forEach((doc) => {

                const data =
                    doc.data();

                // Match responder type
                if (

                    data.services?.includes(type)

                ) {

                    incidents.push({

                        id: doc.id,

                        ...data,

                    });

                }

            });

            res.json({

                success: true,

                incidents,

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                error:
                    "Failed to fetch responder incidents",

            });

        }

    };

/* Deploy Incident */
const deployIncident =

    async (req, res) => {

        try {

            const {
                id,
            } = req.params;

            await db
                .collection("sosAlerts")
                .doc(id)
                .update({

                    status:
                        "DEPLOYED",

                });

            res.json({

                success: true,

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                error:
                    "Deployment failed",

            });

        }

    };

/* Resolve Incident */
const resolveIncident =

    async (req, res) => {

        try {

            const {
                id,
            } = req.params;

            await db
                .collection("sosAlerts")
                .doc(id)
                .update({

                    status:
                        "RESOLVED",

                });

            res.json({

                success: true,

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                error:
                    "Resolve failed",

            });

        }

    };

module.exports = {

    getResponderIncidents,
    deployIncident,
    resolveIncident,

};