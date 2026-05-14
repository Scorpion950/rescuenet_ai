const admin =
    require("firebase-admin");

let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Parse from Render/Heroku environment variable
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Fallback to local file for development
        serviceAccount = require("../serviceAccountKey.json");
    }
} catch (error) {
    console.error("Failed to load Firebase credentials:", error);
}

admin.initializeApp({

    credential:
        admin.credential.cert(
            serviceAccount
        ),

});

const db =
    admin.firestore();

module.exports = db;