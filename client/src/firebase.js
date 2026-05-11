import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyATDFQuxh9Q50oeiba6ZJ1YuAqJKBR4pIM",
    authDomain: "rescuenet-ai-4f7e9.firebaseapp.com",
    projectId: "rescuenet-ai-4f7e9",
    storageBucket: "rescuenet-ai-4f7e9.firebasestorage.app",
    messagingSenderId: "1002185941755",
    appId: "1:1002185941755:web:194a0af312cba1e0b6065e",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);