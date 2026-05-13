const db =
    require("../config/firebase");

/* Update SOS Incident Status */
const updateIncidentStatus =

    async (req, res) => {

        try {

            const {

                incidentId,
                status,

            } = req.body;

            // Valid statuses
            const allowedStatuses = [

                "PENDING",
                "DEPLOYED",
                "RESOLVED",

            ];

            // Validation
            if (

                !allowedStatuses.includes(
                    status
                )

            ) {

                return res.status(400).json({

                    error:
                        "Invalid status",

                });

            }

            // Update Firestore
            await db
                .collection("sosAlerts")
                .doc(incidentId)
                .update({

                    status,

                });

            res.json({

                success: true,

                message:
                    `Incident marked as ${status}`,

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                error:
                    "Failed to update status",

            });

        }

    };

module.exports = {

    updateIncidentStatus,

};