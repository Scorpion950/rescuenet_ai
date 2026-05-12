
const calculateDistance = require(
    "../utils/distanceCalculator"
);

const db = require(
    "../config/firebaseAdmin"
);

const sendSOS = async (req, res) => {

    try {

        const {
            service,
            latitude,
            longitude,
        } = req.body;

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

        // Save SOS
        await db.collection("sosAlerts").add({

            service,
            latitude,
            longitude,
            createdAt: new Date(),

        });

        res.json({

            success: true,

            message:
                `${service} Alert Sent Successfully!`,

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