// Usage: node scripts/setRole.js <email> <admin|responder> [department] [stationId]
// Requires Firebase Admin credentials. Run only from a trusted operator machine.
require("dotenv").config();
const db = require("../config/firebase");
const { normalizeDepartment } = require("../utils/departments");

async function main() {
  const [, , email, role, departmentInput, stationId] = process.argv;
  if (!email || !["admin", "responder"].includes(role)) {
    throw new Error("Usage: node scripts/setRole.js <email> <admin|responder> [department] [stationId]");
  }
  const department = role === "responder" ? normalizeDepartment(departmentInput) : null;
  if (role === "responder" && !department) {
    throw new Error("Responders need a department: Police, Ambulance, or Fire Brigade.");
  }
  const account = await db.admin.auth().getUserByEmail(email);
  await db.admin.auth().setCustomUserClaims(account.uid, {
    role,
    ...(department ? { department } : {}),
    ...(stationId ? { stationId } : {}),
  });
  console.log("Role set for account; user must refresh their ID token or sign in again.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
