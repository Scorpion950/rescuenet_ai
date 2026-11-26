const express = require("express");
const crypto = require("node:crypto");
const db = require("../config/firebase");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
let verifier;

async function verifyAuth0Token(token) {
  const domain = process.env.AUTH0_DOMAIN;
  const audience = process.env.AUTH0_AUDIENCE;
  if (!domain || !audience) {
    throw new Error("Auth0 API verification has not been configured.");
  }

  const issuer = "https://" + domain.replace(/^https?:\/\//, "").replace(/\/+$/, "") + "/";
  if (!verifier || verifier.issuer !== issuer) {
    const { createRemoteJWKSet } = await import("jose");
    verifier = {
      issuer,
      keys: createRemoteJWKSet(new URL(issuer + ".well-known/jwks.json")),
    };
  }
  const { jwtVerify } = await import("jose");
  const result = await jwtVerify(token, verifier.keys, {
    issuer, audience, algorithms: ["RS256"],
  });
  if (!result.payload.sub) throw new Error("Auth0 token has no subject.");
  return result.payload.sub;
}

// Bridge a verified Auth0 civilian session to Firebase Auth so Firestore rules
// and backend operations use one consistent identity.
router.post("/auth/firebase-token", async (req, res) => {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") || "");
  if (!match) return res.status(401).json({ error: "Auth0 access token required." });
  try {
    const subject = await verifyAuth0Token(match[1]);
    const uid = "civilian_" + crypto.createHash("sha256")
      .update(subject).digest("hex").slice(0, 40);
    const firebaseToken = await db.admin.auth()
      .createCustomToken(uid, { role: "civilian" });
    res.json({ firebaseToken });
  } catch (error) {
    console.error("Auth0 token exchange failed:", error.message);
    res.status(401).json({ error: "Could not verify your Auth0 session." });
  }
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.auth });
});

// Passwords shared across an entire department are not suitable for live
// responder authentication. Provision individual Firebase Auth users instead.
router.post(["/responder-login", "/admin-login"], (_req, res) => {
  res.status(410).json({
    error: "Legacy shared-password login was disabled. Use your verified account.",
  });
});

module.exports = router;
