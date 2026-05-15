import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useLocation } from "../../context/LocationContext";

function UserProtectedRoute({ children }) {

    const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
    const { userLocation } = useLocation();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [checking, setChecking] = useState(true);

    // Redirect to Auth0 login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            loginWithRedirect();
        }
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    // Check if user already has a phone number stored
    useEffect(() => {
        if (isAuthenticated && user) {
            checkUserProfile();
        }
    }, [isAuthenticated, user]);

    const checkUserProfile = async () => {
        try {
            const userId = user.sub.replace(/\|/g, "_");
            const userDoc = await getDoc(doc(db, "users", userId));

            if (!userDoc.exists() || !userDoc.data().phone) {
                setShowPhoneModal(true);
            }
        } catch (err) {
            console.error("Error checking user profile:", err);
        } finally {
            setChecking(false);
        }
    };

    const savePhoneAndLocation = async () => {
        if (!phone || phone.trim().length < 10) {
            alert("Please enter a valid phone number with country code (e.g. +919876543210)");
            return;
        }

        try {
            const userId = user.sub.replace(/\|/g, "_");

            // Use the live location from context if available
            const latitude = userLocation ? userLocation[0] : null;
            const longitude = userLocation ? userLocation[1] : null;

            await setDoc(
                doc(db, "users", userId),
                {
                    name: user.name || "",
                    email: user.email || "",
                    phone: phone.trim(),
                    latitude,
                    longitude,
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            setShowPhoneModal(false);
        } catch (err) {
            console.error("Error saving profile:", err);
            alert("Failed to save your details. Please try again.");
        }
    };

    // Loading state
    if (isLoading || (isAuthenticated && checking)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg font-medium">Verifying your identity...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white text-xl">
                Redirecting to secure login...
            </div>
        );
    }

    // Phone number collection modal
    if (showPhoneModal) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-mesh">
                <div className="glass-panel p-10 rounded-3xl w-full max-w-md border border-white/10 animate-fade-in-up shadow-2xl">

                    <div className="text-center mb-6">
                        <div className="text-5xl mb-3">📱</div>
                        <h2 className="text-3xl font-extrabold text-white mb-2">
                            One Last Step
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Enter your phone number to receive <span className="text-red-400 font-semibold">emergency SMS alerts</span> when a disaster is reported near you.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full p-4 rounded-xl bg-slate-800/60 text-white border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-lg tracking-wider"
                        />

                        <button
                            onClick={savePhoneAndLocation}
                            className="btn-premium w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/40"
                        >
                            Continue to RescueNet →
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-5">
                        🔒 Your number is only used for emergency alerts. We respect your privacy.
                    </p>
                </div>
            </div>
        );
    }

    return children;
}

export default UserProtectedRoute;
