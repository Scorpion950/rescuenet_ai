const express =
    require("express");

const router =
    express.Router();

/* RESPONDER LOGIN */
router.post(

    "/responder-login",

    (req, res) => {

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

            return res.json({

                success: true,

                responderType:
                    department,

            });

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

    (req, res) => {

        const { password } =
            req.body;

        if (

            password ===
            process.env.ADMIN_PASSWORD

        ) {

            return res.json({

                success: true,

            });

        }

        return res.status(401).json({

            error:
                "Invalid admin password",

        });

    }

);

module.exports = router;