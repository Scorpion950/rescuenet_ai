const adminAuth = (

    req,
    res,
    next

) => {

    const adminKey =
        req.headers["x-admin-key"];

    if (

        adminKey !==
        process.env.ADMIN_PASSWORD

    ) {

        return res.status(401).json({

            error:
                "Unauthorized admin access",

        });

    }

    next();

};

const responderAuth = (

    req,
    res,
    next

) => {

    const responderKey =
        req.headers["x-responder-key"];

    if (!responderKey) {

        return res.status(401).json({

            error:
                "Unauthorized responder access",

        });

    }

    next();

};

module.exports = {

    adminAuth,
    responderAuth,

};