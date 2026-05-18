const express =
    require("express");

const db = require("../config/firebase");
const admin = db.admin;

const router =
    express.Router();

/* RESPONDER LOGIN */
router.post(

    "/responder-login",

    async (req, res) => {

        const {

            department,
            password,

        } = req.body;

        const credentials = {

            Police:
                process.env.POLICE_PASSWORD,

            Ambulance:
                process.env.AMBULANCE_PASSWORD,

            "Fire Brigade":
                process.env.FIRE_PASSWORD,

        };

        // Valid
        if (

            credentials[department] === password

        ) {
            try {
                // Generate a custom token for the responder
                const firebaseToken = await admin.auth().createCustomToken(`responder_${department.replace(/\s+/g, '')}`);
                
                return res.json({

                    success: true,

                    responderType:
                        department,

                    firebaseToken,

                });
            } catch (error) {
                console.error("Firebase custom token error:", error);
                return res.status(500).json({ error: "Failed to generate auth token" });
            }
        }

        // Invalid
        return res.status(401).json({

            error:
                "Invalid credentials",

        });

    }

);

/* ADMIN LOGIN */
router.post(

    "/admin-login",

    async (req, res) => {

        const { password } =
            req.body;

        if (

            password ===
            process.env.ADMIN_PASSWORD

        ) {
            try {
                // Generate a custom token for the admin
                const firebaseToken = await admin.auth().createCustomToken("admin_user");

                return res.json({

                    success: true,

                    firebaseToken,

                });
            } catch (error) {
                console.error("Firebase custom token error:", error);
                return res.status(500).json({ error: "Failed to generate auth token" });
            }

        }

        return res.status(401).json({

            error:
                "Invalid admin password",

        });

    }

);

module.exports = router;