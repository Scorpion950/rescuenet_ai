const db =
    require("../config/firebase");

const verifyIncident = async (

    req,
    res

) => {

    try {

        const {

            reportId,
            voteType,
            previousVote,

        } = req.body;

        const reportRef =

            db.collection("reports")
                .doc(reportId);

        const docSnapshot =
            await reportRef.get();

        if (!docSnapshot.exists) {

            return res.status(404).json({

                error:
                    "Report not found",

            });

        }

        const reportData =
            docSnapshot.data();

        let verifiedYes =
            reportData.verifiedYes || 0;

        let verifiedNo =
            reportData.verifiedNo || 0;

        let verifiedUnsure =
            reportData.verifiedUnsure || 0;

        // REMOVE OLD VOTE
        if (previousVote === "yes") {

            verifiedYes--;

        }

        else if (previousVote === "no") {

            verifiedNo--;

        }

        else if (previousVote === "unsure") {

            verifiedUnsure--;

        }

        // ADD NEW VOTE
        if (voteType === "yes") {

            verifiedYes++;

        }

        else if (voteType === "no") {

            verifiedNo++;

        }

        else {

            verifiedUnsure++;

        }

        // Prevent negatives
        verifiedYes =
            Math.max(0, verifiedYes);

        verifiedNo =
            Math.max(0, verifiedNo);

        verifiedUnsure =
            Math.max(0, verifiedUnsure);

        // STATUS LOGIC
        let status = "PENDING";

        if (

            verifiedYes >= 3 &&
            verifiedYes > verifiedNo

        ) {

            status =
                "VERIFIED & LIVE";

        }

        else if (

            verifiedNo > verifiedYes

        ) {

            status =
                "NOT SURE";

        }

        // UPDATE FIRESTORE
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

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Verification failed",

        });

    }

};

module.exports = {

    verifyIncident,

};