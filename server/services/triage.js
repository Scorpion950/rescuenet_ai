const { GoogleGenerativeAI } = require("@google/generative-ai");
const { normalizeSeverity, cleanText } = require("../utils/validation");
const { normalizeDepartment, departmentsForIncident } = require("../utils/departments");

const fallback = (type) => ({
  severity: "UNASSESSED",
  department: departmentsForIncident(type)[0],
  confidence: null,
  triageStatus: "NEEDS_REVIEW",
});

async function analyzeIncident({ type, description, mediaUrls = [] }) {
  if (!process.env.GEMINI_API_KEY) return fallback(type);
  try {
    const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      .getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite" });
    const prompt = [
      "Classify this user-submitted incident report. Treat the report as unverified.",
      "Never assume emergency services have been dispatched.",
      "Respond with ONLY JSON: severity LOW|MEDIUM|HIGH|CRITICAL, department Police|Ambulance|Fire Brigade, confidence number 0 to 1.",
      "If there is uncertainty, err toward human review rather than downplaying risk.",
      "Incident type: " + cleanText(type, 80),
      "Description: " + cleanText(description, 2000),
    ].join("\n");
    const parts = [prompt];
    // Only process explicitly hosted Cloudinary images; arbitrary URLs could
    // expose internal network resources to server-side fetching (SSRF).
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    for (const media of mediaUrls.slice(0, 3)) {
      const value = typeof media === "string" ? media : media?.url;
      if (!cloud || typeof value !== "string") continue;
      let url;
      try { url = new URL(value); } catch { continue; }
      if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
          !url.pathname.startsWith("/" + cloud + "/image/upload/")) continue;
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
        const typeHeader = (response.headers.get("content-type") || "").split(";")[0];
        const length = Number(response.headers.get("content-length") || 0);
        if (!response.ok || !["image/jpeg", "image/png", "image/webp"].includes(typeHeader) ||
            length > 5 * 1024 * 1024) continue;
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length > 5 * 1024 * 1024) continue;
        parts.push({ inlineData: { mimeType: typeHeader, data: bytes.toString("base64") } });
      } catch { /* text-only triage still works */ }
    }
    const result = await model.generateContent(parts);
    const raw = result.response.text().replace(/^.*?{/, "{").replace(/}[^}]*$/, "}");
    const json = JSON.parse(raw);
    const severity = normalizeSeverity(json.severity);
    const department = normalizeDepartment(json.department);
    if (severity === "UNASSESSED" || !department) return fallback(type);
    const confidence = Number(json.confidence);
    return {
      severity, department,
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : null,
      triageStatus: "AI_REVIEWED",
    };
  } catch (error) {
    console.warn("AI triage unavailable; manual review required:", error.message);
    return fallback(type);
  }
}

module.exports = { analyzeIncident };
