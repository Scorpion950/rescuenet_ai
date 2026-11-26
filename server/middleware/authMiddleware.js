const db = require("../config/firebase");
const { normalizeDepartment } = require("../utils/departments");

async function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match) return res.status(401).json({ error: "Sign in to continue." });

  try {
    const decoded = await db.admin.auth().verifyIdToken(match[1], true);
    req.auth = {
      uid: decoded.uid,
      role: decoded.role || "civilian",
      department: normalizeDepartment(decoded.department),
      stationId: decoded.stationId || null,
    };
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Sign in again." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Your account cannot perform this action." });
    }
    next();
  };
}

const adminAuth = [requireAuth, requireRole("admin")];
const responderAuth = [requireAuth, requireRole("responder", "admin")];
const civilianAuth = [requireAuth, requireRole("civilian", "admin")];

module.exports = { requireAuth, requireRole, adminAuth, responderAuth, civilianAuth };
