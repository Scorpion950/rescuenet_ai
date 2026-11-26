const { analyzeIncident } = require("../services/triage");
const { cleanText } = require("../utils/validation");

async function analyzeReport(req, res) {
  const description = cleanText(req.body.description, 2000);
  if (description.length < 10) {
    return res.status(400).json({ error: "Describe what happened in at least 10 characters." });
  }
  res.json(await analyzeIncident({
    description,
    type: cleanText(req.body.type, 80),
    mediaUrls: Array.isArray(req.body.mediaUrls) ? req.body.mediaUrls : [],
  }));
}

module.exports = { analyzeReport };
