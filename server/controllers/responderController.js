const db =
    require(
        "../config/firebase"
    );

/* Get responder incidents */
const getResponderIncidents =
    async (req, res) => {

        try {

            const type =
                req.params.type;

            const snapshot =
                await db
                    .collection("sosAlerts")
                    .get();

            const incidents = [];

            snapshot.forEach((doc) => {

                const data =
                    doc.data();

                if (

                    data.services?.includes(
                        type
                    )

                ) {

                    incidents.push({

                        id: doc.id,
                        ...data,

                    });

                }

            });

            res.json(incidents);

        } catch (error) {

            console.log(error);

            res.status(500).json({

                error:
                    "Failed to fetch incidents",

            });

        }

    };

/* Deploy */
const deployIncident =
    async (req, res) => {

        try {

            const id =
                req.params.id;

            await db
                .collection(
                    "sosAlerts"
                )
                .doc(id)
                .update({

                    status:
                        "DEPLOYED",

                    deployed: true,

                    deployedAt:
                        new Date(),

                });

            res.json({
                success: true,
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({

                error:
                    "Deploy failed",

            });

        }

    };

/* Resolve */
const resolveIncident =
    async (req, res) => {

        try {

            const id =
                req.params.id;

            await db
                .collection(
                    "sosAlerts"
                )
                .doc(id)
                .update({

                    status:
                        "RESOLVED",

                    resolved: true,

                    resolvedAt:
                        new Date(),

                });

            res.json({
                success: true,
            });

        } catch (error) {

            console.log(error);

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