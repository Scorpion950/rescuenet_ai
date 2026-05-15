const twilio = require("twilio");
const db = require("../config/firebase");

// Haversine formula — calculate distance between two GPS points in KM
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const sendNearbyAlerts = async (req, res) => {
    try {
        const { latitude, longitude, type, location, severity } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Incident location required" });
        }

        // Initialize Twilio client
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Fetch all registered users from Firestore
        const usersSnapshot = await db.collection("users").get();

        const nearbyPhones = [];

        usersSnapshot.forEach((doc) => {
            const userData = doc.data();

            // Only include users with phone AND stored location
            if (
                userData.phone &&
                userData.latitude !== null &&
                userData.longitude !== null
            ) {
                const distanceKm = getDistanceKm(
                    latitude,
                    longitude,
                    userData.latitude,
                    userData.longitude
                );

                // Alert users within 5KM radius
                if (distanceKm <= 5) {
                    nearbyPhones.push(userData.phone);
                }
            }
        });

        if (nearbyPhones.length === 0) {
            return res.json({
                success: true,
                notified: 0,
                message: "No registered users found in the 5KM radius.",
            });
        }

        // Compose the SMS message
        const severityEmoji =
            severity === "CRITICAL" ? "🚨" : severity === "HIGH" ? "⚠️" : "ℹ️";

        const message = `${severityEmoji} RescueNet ALERT: A ${severity} ${type} incident has been reported near ${location}. Please stay safe and avoid the area. Visit rescuenet-ai.netlify.app for live updates.`;

        // Send SMS to all nearby users (in parallel)
        const smsPromises = nearbyPhones.map((phone) =>
            client.messages
                .create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone,
                })
                .catch((err) =>
                    console.error(`SMS failed for ${phone}: ${err.message}`)
                )
        );

        await Promise.all(smsPromises);

        console.log(
            `[NearbyAlerts] Sent SMS to ${nearbyPhones.length} user(s) within 5KM of (${latitude}, ${longitude})`
        );

        res.json({ success: true, notified: nearbyPhones.length });
    } catch (error) {
        console.error("[NearbyAlerts] Error:", error);
        res.status(500).json({ error: "Failed to send nearby alerts" });
    }
};

module.exports = { sendNearbyAlerts };
