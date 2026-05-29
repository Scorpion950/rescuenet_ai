const db =
    require("../config/firebase");

/* Get incidents for responder */
const getResponderIncidents =

    async (req, res) => {

        try {

            const {
                type,
            } = req.params;

            const incidents = [];

            // Fetch SOS alerts for this responder type
            const sosSnapshot =

                await db
                    .collection("sosAlerts")
                    .get();

            sosSnapshot.forEach((doc) => {

                const data =
                    doc.data();

                // Match responder type
                if (

                    data.services?.includes(type)

                ) {

                    incidents.push({

                        id: doc.id,
                        source: "sos",
                        ...data,

                    });

                }

            });

            // Fetch distributed incidents for this responder type
            try {
                const distSnapshot = await db
                    .collection("incident_distributions")
                    .where("responderType", "==", type)
                    .get();

                distSnapshot.forEach((doc) => {
                    const data = doc.data();
                    
                    // Only include pending distributions
                    if (data.status !== "RESOLVED") {
                        incidents.push({
                            id: doc.id,
                            source: "incident",
                            reportId: data.reportId,
                            ...data,
                        });
                    }
                });
            } catch (distError) {
                console.error("Error fetching distributed incidents:", distError);
                // Continue anyway, at least serve SOS alerts
            }

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
const deployIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const { source } = req.body;
        
        const collectionName = source === "incident" ? "incident_distributions" : "sosAlerts";

        await db.collection(collectionName).doc(id).update({
            status: "DEPLOYED",
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Deployment failed" });
    }
};

/* Resolve Incident */
const resolveIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const { source } = req.body;
        
        const collectionName = source === "incident" ? "incident_distributions" : "sosAlerts";

        await db.collection(collectionName).doc(id).update({
            status: "RESOLVED",
        });

        // Also update the original report status if it's an incident distribution
        if (source === "incident") {
            const distDoc = await db.collection("incident_distributions").doc(id).get();
            if (distDoc.exists) {
                const reportId = distDoc.data().reportId;
                if (reportId) {
                    await db.collection("reports").doc(reportId).update({
                        status: "RESOLVED"
                    });
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Resolve failed" });
    }
};

module.exports = {

    getResponderIncidents,
    deployIncident,
    resolveIncident,

};