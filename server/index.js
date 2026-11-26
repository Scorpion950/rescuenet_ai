require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// Fail fast on missing server credentials rather than serving partially.
require("./config/firebase");
const authRoutes = require("./routes/authRoutes");
const responderRoutes = require("./routes/responderRoutes");
const statusRoutes = require("./routes/statusRoutes");
const sosRoutes = require("./routes/sosRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { startAutoResolveJob } = require("./jobs/autoResolveJob");

const app = express();
// Set to the number of trusted reverse proxies on your deployment platform.
app.set("trust proxy", Math.max(0, Number(process.env.TRUST_PROXY_HOPS) || 0));
const allowedOrigins = new Set([
  "http://localhost:5173", "http://localhost:3000",
  "https://rescuenet-ai.netlify.app",
  "https://rescuenet-ai-4f7e9.web.app",
  ...(process.env.FRONTEND_URL || "").split(",").map((x) => x.trim()).filter(Boolean),
]);
app.disable("x-powered-by");
app.use(cors({
  origin(origin, done) {
    if (!origin || allowedOrigins.has(origin)) {
      return done(null, true);
    }
    return done(new Error("Origin is not allowed."));
  },
}));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
}));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", dispatchMode: "simulation", pushEnabled:
    process.env.ENABLE_PUSH_DELIVERY === "true" });
});
app.use(authRoutes);
app.use(responderRoutes);
app.use(statusRoutes);
app.use(sosRoutes);
app.use(verificationRoutes);
app.use(incidentRoutes);
app.use(aiRoutes);
app.use(notificationRoutes);

app.use((error, _req, res, _next) => {
  console.error("Request error:", error.message);
  res.status(error.type === "entity.too.large" ? 413 : 400)
    .json({ error: "The request could not be processed." });
});

if (require.main === module) {
  if (process.env.RUN_BACKGROUND_JOBS !== "false") startAutoResolveJob();
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => console.log("RescueNet API listening on port " + port));
}

module.exports = app;
