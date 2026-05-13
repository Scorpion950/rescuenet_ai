const cron =
    require("node-cron");

const db =
    require(
        "../config/firebase"
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

                const now =
                    Date.now();

                // Proper async loop
                for (

                    const doc of reportsSnapshot.docs

                ) {

                    const report =
                        doc.data();

                    // Skip resolved incidents
                    if (

                        report.status ===
                        "RESOLVED"

                    ) {

                        continue;

                    }

                    let createdAt;

                    // Firestore Timestamp
                    if (

                        report.createdAt?._seconds

                    ) {

                        createdAt =

                            report.createdAt
                                ._seconds * 1000;

                    }

                    // Normal Date String
                    else {

                        createdAt =
                            new Date(

                                report.createdAt

                            ).getTime();

                    }

                    // Invalid timestamp safety
                    if (

                        !createdAt ||

                        isNaN(createdAt)

                    ) {

                        continue;

                    }

                    const THIRTY_MINUTES =

                        30 * 60 * 1000;

                    const expired =

                        now - createdAt >

                        THIRTY_MINUTES;

                    // Auto Resolve
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