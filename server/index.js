const express = require("express");
const cron = require("node-cron");
const calculateDistance = require(
    "./utils/distanceCalculator"
);
const cors = require("cors");
require("dotenv").config();

const admin = require("firebase-admin");

const serviceAccount = require(
    "./config/rescuenet-ai-key.json"
);

const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");

const app = express();

admin.initializeApp({

    credential: admin.credential.cert(
        serviceAccount
    ),

});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

// Gemini Setup
const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

// AI Route
app.post("/analyze-report", async (req, res) => {

    try {

        const { description } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
        });

        const prompt = `
      Analyze this emergency report and classify severity:
      LOW, MEDIUM, HIGH, or CRITICAL.

      Report:
      ${description}

      Return ONLY one word.
    `;

        const result = await model.generateContent(prompt);

        const response =
            result.response.text().trim();

        res.json({
            severity: response,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "AI analysis failed",
        });

    }

});

// Verification Route
app.post("/verify-incident", async (req, res) => {

    try {

        const { reportId, voteType } = req.body;

        const reportRef = db
            .collection("reports")
            .doc(reportId);

        const docSnapshot =
            await reportRef.get();

        if (!docSnapshot.exists) {

            return res.status(404).json({
                error: "Report not found",
            });

        }

        const reportData = docSnapshot.data();

        let verifiedYes =
            reportData.verifiedYes || 0;

        let verifiedNo =
            reportData.verifiedNo || 0;

        let verifiedUnsure =
            reportData.verifiedUnsure || 0;

        // Vote Handling
        if (voteType === "yes") {

            verifiedYes++;

        }

        else if (voteType === "no") {

            verifiedNo++;

        }

        else {

            verifiedUnsure++;

        }

        // Status Logic
        let status = "PENDING";

        if (
            verifiedYes >= 3 &&
            verifiedYes > verifiedNo
        ) {

            status = "VERIFIED & LIVE";

        }

        else if (
            verifiedNo >= verifiedYes
        ) {

            status = "NOT SURE";

        }

        // Update Firestore
        await reportRef.update({

            verifiedYes,
            verifiedNo,
            verifiedUnsure,
            status,

        });

        res.json({
            success: true,
            status,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Verification failed",
        });

    }

});

// Auto Resolve Incidents Every 5 Minutes
cron.schedule("*/5 * * * *", async () => {

    console.log("Checking incidents...");

    try {

        const reportsSnapshot =
            await db.collection("reports").get();

        const now = Date.now();

        reportsSnapshot.forEach(async (doc) => {

            const report = doc.data();

            // Skip already resolved
            if (report.status === "RESOLVED") {
                return;
            }

            // Firestore Timestamp → JS Date
            const createdAt =
                report.createdAt?._seconds
                    ? report.createdAt._seconds * 1000
                    : new Date(report.createdAt).getTime();

            // 30 minutes
            const THIRTY_MINUTES =
                30 * 60 * 1000;

            const isExpired =
                now - createdAt > THIRTY_MINUTES;

            // Auto resolve
            if (isExpired) {

                await db
                    .collection("reports")
                    .doc(doc.id)
                    .update({

                        status: "RESOLVED",

                    });

                console.log(
                    `Resolved: ${doc.id}`
                );

            }

        });

    } catch (error) {

        console.error(
            "Auto resolve error:",
            error
        );

    }

});

// Nearby Incidents Route
app.post("/nearby-incidents", async (req, res) => {

    try {

        const {
            latitude,
            longitude,
        } = req.body;

        const reportsSnapshot =
            await db.collection("reports").get();

        const nearbyReports = [];

        reportsSnapshot.forEach((doc) => {

            const report = doc.data();

            // Skip resolved incidents
            if (report.status === "RESOLVED") {
                return;
            }

            // Ensure coordinates exist
            if (
                !report.latitude ||
                !report.longitude
            ) {
                return;
            }

            // Distance Calculation
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
            incidents: nearbyReports,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Failed to fetch nearby incidents",
        });

    }

});

// SOS Route
app.post("/send-sos", async (req, res) => {

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

            // Skip invalid coords
            if (
                !sos.latitude ||
                !sos.longitude
            ) {
                continue;
            }

            // Distance check
            const distance =
                calculateDistance(

                    latitude,
                    longitude,

                    sos.latitude,
                    sos.longitude

                );

            // Time check
            const createdAt =
                sos.createdAt?._seconds
                    ? sos.createdAt._seconds * 1000
                    : new Date(
                        sos.createdAt
                    ).getTime();

            const FIVE_MINUTES =
                5 * 60 * 1000;

            const recent =
                now - createdAt
                < FIVE_MINUTES;

            // Block duplicate area SOS
            if (
                distance <= 1 &&
                recent
            ) {

                blocked = true;

                break;

            }

        }

        // Reject spam
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

});

// Server Start
const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});