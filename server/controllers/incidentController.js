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

// Distribute incident to nearby responders
const distributeIncidentToResponders = async (
    req,
    res
) => {
    try {
        const {
            reportId,
            latitude,
            longitude,
            type,
            severity,
        } = req.body;

        if (!reportId || !latitude || !longitude) {
            return res.status(400).json({
                error: "Missing required fields: reportId, latitude, longitude",
            });
        }

        // Find all responder stations data
        const stationsData = require("../data/stations");
        const nearbyStations = [];

        // Calculate distances to stations
        for (const station of stationsData) {
            const distance = calculateDistance(
                latitude,
                longitude,
                station.latitude,
                station.longitude
            );

            // Within 20 KM radius
            if (distance <= 20) {
                nearbyStations.push({
                    ...station,
                    distance: distance.toFixed(2),
                });
            }
        }

        // Fallback: if still none found in 20 km, pick the nearest station of each type
        if (nearbyStations.length === 0) {
            const typesNeeded = ["Police", "Ambulance", "Fire Brigade"];
            for (const t of typesNeeded) {
                const ofType = stationsData
                    .map(s => ({ ...s, distance: calculateDistance(latitude, longitude, s.latitude, s.longitude).toFixed(2) }))
                    .filter(s => s.type === t)
                    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
                if (ofType.length > 0) nearbyStations.push(ofType[0]);
            }
        }

        // Determine responder types based on incident type
        let responderTypes = ["ambulance"];
        if (type && type.toLowerCase().includes("fire")) {
            responderTypes.push("fire");
        }
        if (type && (type.toLowerCase().includes("crime") || type.toLowerCase().includes("accident"))) {
            responderTypes.push("police");
        }

        // Create distribution records for each responder type
        for (const responderType of responderTypes) {
            const filteredStations = nearbyStations.filter(
                s => s.type === responderType
            );

            if (filteredStations.length > 0) {
                // Create a distribution record in a new collection
                await db.collection("incident_distributions").add({
                    reportId,
                    responderType,
                    stations: filteredStations,
                    latitude,
                    longitude,
                    type,
                    severity,
                    status: "PENDING",
                    createdAt: new Date(),
                    acknowledgedBy: [],
                });
            }
        }

        res.json({
            success: true,
            message: "Incident distributed to nearby responders",
            nearbyStations,
        });

    } catch (error) {
        console.error("Distribution error:", error);
        res.status(500).json({
            error: "Failed to distribute incident",
        });
    }
};

module.exports = {
    getNearbyIncidents,
    distributeIncidentToResponders,
};