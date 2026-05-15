import {
    useEffect,
    useState,
    useRef,
} from "react";

import { db } from "../firebase";

import {
    collection,
    addDoc,
} from "firebase/firestore";

import {
    classifyEmergency,
} from "../utils/ai";

import {
    API_BASE_URL,
} from "../utils/constants";

import { useLocation } from "../context/LocationContext";

function Report() {

    const { userLocation } = useLocation();

    const [formData, setFormData] =
        useState({

            type: "",
            description: "",
            location: "Detecting location...",
            latitude: null,
            longitude: null,
            media: [],

        });

    const [loading, setLoading] =
        useState(false);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Update coordinates when context changes (Global Watcher)
    useEffect(() => {
        if (userLocation) {
            const [lat, lon] = userLocation;
            
            // Update coords immediately
            setFormData(prev => ({
                ...prev,
                latitude: lat,
                longitude: lon
            }));

            // Fetch human readable address (Debounced/Cached behavior)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(res => res.json())
                .then(data => {
                    const address = data.address || {};
                    const areaName = address.suburb || address.neighbourhood || address.city || address.town || address.village || address.state_district || "Current Location";
                    setFormData(prev => ({ ...prev, location: areaName }));
                })
                .catch(err => console.error("Reverse geocoding failed:", err));
        }
    }, [userLocation]);

    // Handle input changes
    const handleChange = (e) => {

        const { name, value } =
            e.target;

        setFormData((prev) => ({

            ...prev,
            [name]:
                value,

        }));

    };

    // Handle media selection
    const handleMediaChange = (e) => {

        const files =
            Array.from(e.target.files);

        setFormData((prev) => ({

            ...prev,
            media: [
                ...prev.media,
                ...files
            ],

        }));

    };

    // Remove media
    const removeMedia = (index) => {

        setFormData((prev) => ({

            ...prev,

            media:
                prev.media.filter(
                    (_, i) =>
                        i !== index
                ),

        }));

    };

    // Submit Report
    const handleSubmit = async (e) => {

        if (e) e.preventDefault();

        if (!formData.type || !formData.description) {

            alert(
                "Please fill in all fields"
            );

            return;

        }

        setLoading(true);

        try {

            // Step 1: Upload media to Cloudinary
            const mediaUrls = [];

            for (const file of formData.media) {

                const data =
                    new FormData();

                data.append(
                    "file",
                    file
                );

                data.append(
                    "upload_preset",
                    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
                );

                const res =
                    await fetch(
                        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,

                        {
                            method: "POST",
                            body: data,
                        }

                    );

                const fileData =
                    await res.json();

                mediaUrls.push({

                    url:
                        fileData.secure_url,

                    type:
                        fileData.resource_type,

                });

            }

            // Step 2: Use AI to refine severity
            const aiAnalysis =
                await classifyEmergency(
                    formData.description,
                    mediaUrls.length > 0 ? mediaUrls[0].url : null
                );

            const finalSeverity =
                aiAnalysis.severity || "LOW";

            // Step 3: Save to Firestore
            await addDoc(

                collection(
                    db,
                    "incidents"
                ),

                {

                    type:
                        formData.type,

                    description:
                        formData.description,

                    location:
                        formData.location,

                    severity:
                        finalSeverity,

                    media:
                        mediaUrls,

                    latitude:
                        formData.latitude,

                    longitude:
                        formData.longitude,

                    verifiedYes: 0,
                    verifiedNo: 0,
                    verifiedUnsure: 0,

                    status: "PENDING",

                    createdAt:
                        new Date(),

                }

            );

            // Trigger Twilio SMS for CRITICAL emergencies (admin)
            if (finalSeverity === "CRITICAL") {
                try {
                    await fetch(`${API_BASE_URL}/send-emergency-sms`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            location: formData.location,
                            type: formData.type,
                            description: formData.description
                        })
                    });
                } catch (smsError) {
                    console.error("SMS trigger failed", smsError);
                }
            }

            // Trigger SMS alerts to nearby registered users (all severities)
            try {
                await fetch(`${API_BASE_URL}/send-nearby-alerts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                        type: formData.type,
                        location: formData.location,
                        severity: finalSeverity,
                    })
                });
            } catch (nearbyErr) {
                console.error("Nearby alerts failed:", nearbyErr);
            }

            alert(
                "Incident Report Submitted Successfully!"
            );

            // Reset form
            setFormData((prev) => ({

                type: "",
                description: "",
                media: [],

                location:
                    prev.location,

                latitude:
                    prev.latitude,

                longitude:
                    prev.longitude,

            }));

        }

        catch (error) {

            console.error(error);

            alert(
                "Failed to submit report"
            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-slate-950 text-white pb-20 pt-10 px-4">

            <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in-up">

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400 mb-2">
                        Report Emergency
                    </h1>
                    <p className="text-slate-400 font-medium">Your report will be analyzed by AI and sent to nearby responders.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* LOCATION PREVIEW */}
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-blue-500/30 transition-colors">
                        <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Incident Location</label>
                            <p className="text-blue-200 font-semibold truncate max-w-[400px]">
                                {formData.location}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-400 ml-1">Emergency Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-slate-900 border border-white/10 focus:ring-2 focus:ring-red-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Type</option>
                                <option value="Fire">Fire</option>
                                <option value="Accident">Accident</option>
                                <option value="Medical">Medical</option>
                                <option value="Flood">Flood</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-400 ml-1">Media Evidence</label>
                            <div className="flex gap-2">
                                {/* Native Gallery Upload */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="flex-1 bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors group"
                                >
                                    <span className="text-xl group-hover:scale-125 transition-transform">📁</span>
                                    <span className="font-bold text-xs uppercase tracking-tight">Gallery</span>
                                </button>
                                
                                {/* Native Camera Trigger */}
                                <button
                                    type="button"
                                    onClick={() => cameraInputRef.current.click()}
                                    className="flex-1 bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-colors group"
                                >
                                    <span className="text-xl group-hover:scale-125 transition-transform">📷</span>
                                    <span className="font-bold text-xs uppercase tracking-tight text-blue-200">Live Camera</span>
                                </button>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleMediaChange}
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                            />
                            
                            <input
                                type="file"
                                ref={cameraInputRef}
                                onChange={handleMediaChange}
                                capture="environment"
                                accept="image/*,video/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-400 ml-1">Incident Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Describe the situation... (AI will detect severity based on your words)"
                            className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    {/* MEDIA PREVIEW */}
                    {formData.media.length > 0 && (
                        <div className="flex flex-wrap gap-4 p-4 bg-slate-900/30 rounded-2xl border border-white/5">
                            {formData.media.map((file, i) => (
                                <div key={i} className="relative group">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-500/50">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeMedia(i)}
                                        className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 transition-transform"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-5 rounded-2xl font-black text-xl tracking-widest uppercase transition-all shadow-2xl ${
                            loading 
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 hover:scale-[1.02] active:scale-95 shadow-red-900/30"
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                AI ANALYZING...
                            </span>
                        ) : (
                            "Submit Report"
                        )}
                    </button>

                </form>

            </div>

        </div>

    );

}

export default Report;