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

const authRoutes =
    require("./routes/authRoutes");

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

const smsRoutes =
    require("./routes/smsRoutes");

const nearbyAlertsRoutes =
    require("./routes/nearbyAlertsRoutes");

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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',           // Vite dev
  'http://localhost:3000',           // React dev
  'https://rescuenet-ai.netlify.app', // Netlify production
  'https://rescuenet-ai-4f7e9.web.app' // Firebase hosting
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow any Vercel deployment (preview + production)
    if (/^https:\/\/rescuenet[\w-]*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  },
  credentials: true
}));

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
    authRoutes
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

app.use(
    "/",
    smsRoutes
);

app.use(
    "/",
    nearbyAlertsRoutes
);

/* START BACKGROUND JOBS */
startAutoResolveJob();

/* GEMINI AI */
const genAI =
    new GoogleGenerativeAI(

        process.env.GEMINI_API_KEY

    );

/* SERVER START */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(

        `Server running on port ${PORT}`

    );

});