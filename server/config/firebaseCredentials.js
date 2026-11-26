const fs = require("node:fs");
const path = require("node:path");

const LEGACY_LOCAL_KEY = path.join(__dirname, "..", "serviceAccountKey.json");

// Resolve the credential source without loading or printing private keys.
// Explicit configuration always takes precedence over the optional legacy
// local file. No fake credentials or production authentication bypasses.
function selectFirebaseCredentials(env = process.env, existsSync = fs.existsSync, cwd = process.cwd()) {
  if (env.NODE_ENV === "production" &&
      (env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_AUTH_EMULATOR_HOST)) {
    throw new Error("Firebase emulators must not be used with NODE_ENV=production.");
  }
  const inline = env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (inline) {
    let data;
    try {
      data = JSON.parse(inline);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON. Check the private server environment.");
    }
    if (!data || typeof data !== "object" || !data.project_id ||
        !data.client_email || !data.private_key) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT must contain the complete Firebase service-account JSON.");
    }
    return { kind: "inline", data };
  }

  const explicitPath = env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (explicitPath) {
    const file = path.resolve(cwd, explicitPath);
    if (!existsSync(file)) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH does not point to an existing file. Check the path in server/.env.");
    }
    return { kind: "file", file };
  }

  const googleCredentials = env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (googleCredentials) {
    const file = path.resolve(cwd, googleCredentials);
    if (!existsSync(file)) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS points to a missing file. Check the path in server/.env.");
    }
    return { kind: "adc" };
  }

  const firestoreEmulator = Boolean(env.FIRESTORE_EMULATOR_HOST);
  const authEmulator = Boolean(env.FIREBASE_AUTH_EMULATOR_HOST);
  if (firestoreEmulator || authEmulator) {
    if (!firestoreEmulator || !authEmulator) {
      throw new Error("Local emulator mode requires BOTH FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST.");
    }
    return { kind: "emulator" };
  }

  // Workload identity / Application Default Credentials on managed Google Cloud.
  if (env.K_SERVICE || env.GAE_ENV || env.FUNCTION_TARGET ||
      env.FUNCTION_NAME) {
    return { kind: "adc" };
  }

  // Backward-compatible local development. This file is ignored by Git and
  // excluded from distributable ZIPs; users supply their own private key.
  if (existsSync(LEGACY_LOCAL_KEY)) {
    return { kind: "file", file: LEGACY_LOCAL_KEY };
  }

  if (env.GOOGLE_CLOUD_PROJECT) return { kind: "adc" };

  throw new Error([
    "Firebase Admin credentials are missing.",
    "For local development, put your private serviceAccountKey.json in server/",
    "(automatically detected), or set GOOGLE_APPLICATION_CREDENTIALS to its",
    "absolute path in server/.env. For deployment, use a server-only secret",
    "or Google Cloud workload identity. See README.md for setup steps.",
  ].join(" "));
}

module.exports = { selectFirebaseCredentials, LEGACY_LOCAL_KEY };
