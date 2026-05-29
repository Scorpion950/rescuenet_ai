const admin = require("firebase-admin");

let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Production: Parse from environment variable (Render, Railway, Vercel, etc.)
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log("✅ Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT env var");
    } else {
        // Local development: Load from serviceAccountKey.json file
        serviceAccount = require("../serviceAccountKey.json");
        console.log("✅ Firebase credentials loaded from serviceAccountKey.json");
    }
} catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
        console.error(`
╔══════════════════════════════════════════════════════════╗
║          Firebase Service Account Key Missing!           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  The file 'server/serviceAccountKey.json' was not found. ║
║                                                          ║
║  HOW TO FIX (Local Development):                         ║
║  1. Go to Firebase Console:                              ║
║     https://console.firebase.google.com                  ║
║  2. Select your project: rescuenet-ai-4f7e9              ║
║  3. Project Settings → Service accounts                  ║
║  4. Click "Generate new private key"                     ║
║  5. Save the downloaded file as:                         ║
║     server/serviceAccountKey.json                        ║
║                                                          ║
║  HOW TO FIX (Production / Render):                       ║
║  Set the FIREBASE_SERVICE_ACCOUNT environment variable   ║
║  to the entire JSON content of the service account key.  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `);
    } else {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", error.message);
    }
    process.exit(1); // Stop server immediately with clear guidance
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.admin = admin; // Attach admin to db for use in other modules

module.exports = db;