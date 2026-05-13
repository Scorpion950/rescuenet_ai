const db = require(
    "../config/firebase"
);

const calculateDistance = require(
    "../utils/distanceCalculator"
);

const getNearbyIncidents = async (
    req,
    res
) => {

    try {

        const {
            latitude,
            longitude,
        } = req.body;

        const reportsSnapshot =
            await db
                .collection("reports")
                .get();

        const nearbyReports = [];

        const now = Date.now();
        const THIRTY_MINS = 30 * 60 * 1000;

        for (const doc of reportsSnapshot.docs) {

            const report = doc.data();
            const reportId = doc.id;

            // Skip resolved
            if (
                report.status ===
                "RESOLVED"
            ) {
                continue;
            }

            // AUTO-RESOLUTION LOGIC
            const createdAt = report.createdAt?.toDate() || new Date(0);
            const updatedAt = report.updatedAt?.toDate() || createdAt;
            
            const timeSinceCreated = now - createdAt.getTime();
            const timeSinceUpdated = now - updatedAt.getTime();

            const isStale = timeSinceCreated > THIRTY_MINS && timeSinceUpdated > THIRTY_MINS;
            const hasTooManyNos = report.verifiedNo > (report.verifiedYes + 5); // 5 more No's than Yes's

            if (isStale || hasTooManyNos) {
                // Auto-resolve in database
                await db.collection("reports").doc(reportId).update({
                    status: "RESOLVED",
                    autoResolved: true,
                    resolvedAt: new Date()
                });
                continue; // Skip from nearby results
            }

            // Ensure coords exist
            if (
                !report.latitude ||
                !report.longitude
            ) {
                continue;
            }

            // Distance calculation
            const distance =
                calculateDistance(

                    latitude,
                    longitude,

                    report.latitude,
                    report.longitude

                );

            // Within 3 KM
            if (distance <= 3) {

                nearbyReports.push({

                    id: reportId,
                    ...report,
                    distance:
                        distance.toFixed(2),

                });

            }

        }

        res.json({

            incidents:
                nearbyReports,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Failed to fetch nearby incidents",

        });

    }

};

module.exports = {
    getNearbyIncidents,
};