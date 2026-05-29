import { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useLocation } from "../../context/LocationContext";

function UserProtectedRoute({ children }) {

    const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
    const { userLocation } = useLocation();

    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [checking, setChecking] = useState(true);

    const hasChecked = useRef(false);

    useEffect(() => {
        // Wait for Auth0 to finish loading
        if (isLoading) return;

        // Not logged in — redirect to Auth0 login
        if (!isAuthenticated) {
            loginWithRedirect({
                appState: { returnTo: window.location.pathname },
            });
            return;
        }

        // Logged in — check Firestore for phone number
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkProfile = async () => {
            // Auth0 user.sub is the unique user ID (e.g. "google-oauth2|123...")
            const userId = user.sub.replace("|", "_"); // Firestore doc IDs can't have |

            // Check localStorage cache first to avoid hitting Firestore on every nav
            const cached = localStorage.getItem(`phone_saved_${userId}`);
            if (cached === "true") {
                setChecking(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists() && userDoc.data().phone) {
                    localStorage.setItem(`phone_saved_${userId}`, "true");
                    setShowPhoneModal(false);
                } else {
                    setShowPhoneModal(true);
                }
            } catch (err) {
                console.error("Error checking user profile:", err);
            } finally {
                setChecking(false);
            }
        };

        checkProfile();
    }, [isLoading, isAuthenticated, user, loginWithRedirect]);

    const savePhoneAndLocation = async () => {
        // Auto-prepend +91 if user enters 10-digit Indian number without country code
        let normalized = phone.trim().replace(/[\s\-\(\)]/g, "");
        if (normalized.startsWith("0")) normalized = normalized.slice(1);
        if (!normalized.startsWith("+")) {
            normalized = normalized.length === 10 ? `+91${normalized}` : `+${normalized}`;
        }

        if (normalized.length < 10) {
            alert("Please enter a valid phone number (e.g. +91 98765 43210 or 9876543210)");
            return;
        }

        try {
            const userId = user.sub.replace("|", "_");
            const latitude = userLocation ? userLocation[0] : null;
            const longitude = userLocation ? userLocation[1] : null;

            await setDoc(
                doc(db, "users", userId),
                {
                    auth0Id: user.sub,
                    name: user.name || "",
                    email: user.email || "",
                    picture: user.picture || "",
                    phone: normalized,
                    latitude,
                    longitude,
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            localStorage.setItem(`phone_saved_${userId}`, "true");
            setShowPhoneModal(false);

        } catch (err) {
            console.error("Error saving profile:", err);
            alert("Failed to save your details. Please try again.");
        }
    };

    // Auth0 still loading
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

    // Phone number collection modal
    if (showPhoneModal) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-mesh">
                <div className="glass-panel p-10 rounded-3xl w-full max-w-md border border-white/10 animate-fade-in-up shadow-2xl">

                    {/* User greeting */}
                    {user?.picture && (
                        <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="w-12 h-12 rounded-full ring-2 ring-blue-500/50"
                            />
                            <div>
                                <p className="text-white font-semibold">{user.name}</p>
                                <p className="text-gray-400 text-xs">{user.email}</p>
                            </div>
                        </div>
                    )}

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
