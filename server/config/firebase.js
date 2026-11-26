const admin = require("firebase-admin");
const { selectFirebaseCredentials } = require("./firebaseCredentials");

if (!admin.apps.length) {
  const selection = selectFirebaseCredentials();
  const options = {
    ...(process.env.FIREBASE_PROJECT_ID
      ? { projectId: process.env.FIREBASE_PROJECT_ID }
      : {}),
  };

  if (selection.kind === "inline") {
    options.credential = admin.credential.cert(selection.data);
  } else if (selection.kind === "file") {
    options.credential = admin.credential.cert(selection.file);
  } else if (selection.kind === "adc") {
    options.credential = admin.credential.applicationDefault();
  } else {
    // Local Firestore + Authentication emulator, never in production.
    options.projectId = options.projectId || "demo-rescuenet";
  }

  admin.initializeApp(options);
}

const db = admin.firestore();
db.admin = admin;
module.exports = db;
