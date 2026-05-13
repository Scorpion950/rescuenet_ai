require("dotenv").config();

const express =
    require("express");

const cors =
    require("cors");

const cron =
    require("node-cron");

const rateLimit =
    require("express-rate-limit");

const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");

/* ROUTES */
const responderRoutes =
    require("./routes/responderRoutes");

const statusRoutes =
    require("./routes/statusRoutes");

const sosRoutes =
    require("./routes/sosRoutes");

const verificationRoutes =
    require("./routes/verificationRoutes");

const incidentRoutes =
    require("./routes/incidentRoutes");

const aiRoutes =
    require("./routes/aiRoutes");

/* JOBS */
const {
    startAutoResolveJob,
} = require(
    "./jobs/autoResolveJob"
);

/* FIREBASE INIT */
require("./config/firebase");

/* EXPRESS APP */
const app = express();

/* MIDDLEWARE */
app.use(cors());

app.use(express.json());

/* RATE LIMITER */
const limiter = rateLimit({

    windowMs:
        1 * 60 * 1000,

    max: 200,

    message:
        "Too many requests. Please try again later.",

});

app.use(limiter);

/* ROUTES */
app.use(
    "/",
    responderRoutes
);

app.use(
    "/",
    statusRoutes
);

app.use(
    "/",
    sosRoutes
);

app.use(
    "/",
    verificationRoutes
);

app.use(
    "/",
    incidentRoutes
);

app.use(
    "/",
    aiRoutes
);

/* START BACKGROUND JOBS */
startAutoResolveJob();

/* GEMINI AI */
const genAI =
    new GoogleGenerativeAI(

        process.env.GEMINI_API_KEY

    );

/* SERVER START */
const PORT = 5000;

app.listen(PORT, () => {

    console.log(

        `Server running on port ${PORT}`

    );

});