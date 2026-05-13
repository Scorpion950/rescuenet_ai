
const calculateDistance = require(
    "../utils/distanceCalculator"
);

const findNearestStations =
    require("../utils/findNearestStations");

const db = require(
    "../config/firebase"
);

const sendSOS = async (req, res) => {

    try {

        const {

            services,
            latitude,
            longitude,
            location,

        } = req.body;

        if (

            !services ||

            !Array.isArray(services) ||

            services.length === 0

        ) {

            return res.status(400).json({

                error:
                    "At least one emergency service is required."

            });

        }

        const sosSnapshot =
            await db
                .collection("sosAlerts")
                .get();

        const now = Date.now();

        let blocked = false;

        for (const doc of sosSnapshot.docs) {

            const sos = doc.data();

            // Skip invalid coordinates
            if (
                !sos.latitude ||
                !sos.longitude
            ) {
                continue;
            }

            // Distance calculation
            const distance =
                calculateDistance(

                    latitude,
                    longitude,

                    sos.latitude,
                    sos.longitude

                );

            // Timestamp handling
            const createdAt =
                sos.createdAt?._seconds
                    ? sos.createdAt._seconds * 1000
                    : new Date(
                        sos.createdAt
                    ).getTime();

            // 5 minute cooldown
            const FIVE_MINUTES =
                5 * 60 * 1000;

            const recent =
                now - createdAt
                < FIVE_MINUTES;

            // Block nearby spam
            if (
                distance <= 1 &&
                recent
            ) {

                blocked = true;

                break;

            }

        }

        // Reject duplicate area SOS
        if (blocked) {

            return res.status(400).json({

                error:
                    "SOS already triggered in this area recently.",

            });

        }

        // Find nearest responder stations
        const nearestStations =

            findNearestStations(

                services,
                latitude,
                longitude

            );

        // Save SOS
        await db.collection("sosAlerts").add({

            services,
            assignedStations:
                nearestStations,
            latitude,
            longitude,
            location,
            createdAt: new Date(),


        });

        res.json({

            success: true,

            message:

                `${services.join(", ")} Alert Sent Successfully!`,

            assignedStations:
                nearestStations,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Failed to send SOS",

        });

    }

};

module.exports = {
    sendSOS,
};