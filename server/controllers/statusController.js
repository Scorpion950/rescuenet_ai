const db =
    require("../config/firebase");

const updateIncidentStatus =
    async (req, res) => {

        try {

            const {

                incidentId,
                status,

            } = req.body;

            if (

                !incidentId ||

                !status

            ) {

                return res.status(400).json({

                    error:
                        "Missing fields",

                });

            }

            await db

                .collection("sosAlerts")

                .doc(incidentId)

                .update({

                    status,

                });

            return res.json({

                success: true,

                message:
                    "Status updated",

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                error:
                    "Failed to update status",

            });

        }

    };

module.exports = {

    updateIncidentStatus,

};