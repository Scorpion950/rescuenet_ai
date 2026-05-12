const cron = require("node-cron");

const db = require(
    "../config/firebaseAdmin"
);

// Auto Resolve Every 5 Minutes
const startAutoResolveJob = () => {

    cron.schedule(
        "*/5 * * * *",

        async () => {

            console.log(
                "Checking incidents..."
            );

            try {

                const reportsSnapshot =
                    await db
                        .collection("reports")
                        .get();

                const now = Date.now();

                reportsSnapshot.forEach(
                    async (doc) => {

                        const report =
                            doc.data();

                        // Skip resolved
                        if (
                            report.status ===
                            "RESOLVED"
                        ) {
                            return;
                        }

                        // Timestamp handling
                        const createdAt =
                            report.createdAt?._seconds
                                ? report.createdAt._seconds
                                * 1000
                                : new Date(
                                    report.createdAt
                                ).getTime();

                        const THIRTY_MINUTES =
                            30 * 60 * 1000;

                        const expired =
                            now - createdAt
                            > THIRTY_MINUTES;

                        // Auto resolve
                        if (expired) {

                            await db
                                .collection(
                                    "reports"
                                )
                                .doc(doc.id)
                                .update({

                                    status:
                                        "RESOLVED",

                                });

                            console.log(

                                `Resolved: ${doc.id}`

                            );

                        }

                    }
                );

            } catch (error) {

                console.error(
                    "Auto resolve error:",
                    error
                );

            }

        }

    );

};

module.exports = {
    startAutoResolveJob,
};