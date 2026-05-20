import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Sign in anonymously by default so Live Map can read data securely
// Wrap with more helpful guidance if the request is blocked (403)
(async () => {
    try {
        await signInAnonymously(auth);
    } catch (error) {
        console.warn("Firebase Anonymous Auth failed (ensure it's enabled in Firebase Console):", error);

        // If requests are blocked with a 403 from identitytoolkit, provide actionable guidance
        if (error && error.code && error.message && error.message.includes('are-blocked')) {
            console.error(
                "Firebase identitytoolkit requests are blocked. Check the following:\n" +
                "1) In Firebase Console -> Authentication, enable Anonymous sign-in or the provider you're using.\n" +
                "2) In Google Cloud Console -> APIs & Services -> Credentials, ensure your API key allows identitytoolkit calls or add appropriate HTTP referrers (e.g., http://localhost:5173).\n" +
                "3) Ensure Firebase Auth / Identity Toolkit APIs are enabled for the project.\n"
            );
        }
    }
})();