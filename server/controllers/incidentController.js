const db = require(
    "../config/firebaseAdmin"
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

        reportsSnapshot.forEach((doc) => {

            const report = doc.data();

            // Skip resolved
            if (
                report.status ===
                "RESOLVED"
            ) {
                return;
            }

            // Ensure coords exist
            if (
                !report.latitude ||
                !report.longitude
            ) {
                return;
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

                    id: doc.id,
                    ...report,
                    distance:
                        distance.toFixed(2),

                });

            }

        });

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