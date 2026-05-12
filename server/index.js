const rateLimit =
    require("express-rate-limit");

// Rate Limiter
const limiter = rateLimit({

    windowMs:
        1 * 60 * 1000,

    max: 20,

    message:

        "Too many requests. Please try again later.",

});

require("dotenv").config();

const express = require("express");
const cron = require("node-cron");
const calculateDistance = require(
    "./utils/distanceCalculator"
);

const sosRoutes = require(
    "./routes/sosRoutes"
);

const verificationRoutes =
    require(
        "./routes/verificationRoutes"
    );

const incidentRoutes =
    require(
        "./routes/incidentRoutes"
    );

const aiRoutes = require(
    "./routes/aiRoutes"
);

const {
    startAutoResolveJob,
} = require(
    "./jobs/autoResolveJob"
);

const cors = require("cors");
require("dotenv").config();

const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");

const app = express();

const db = require(
    "./config/firebaseAdmin"
);

app.use(cors());
app.use(express.json());

app.use(limiter);

app.use("/", sosRoutes);

app.use("/", verificationRoutes);

app.use("/", incidentRoutes);

app.use("/", aiRoutes);

startAutoResolveJob();

// Gemini Setup
const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);


// Server Start
const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});