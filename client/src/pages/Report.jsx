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

function Report() {

    const [loading, setLoading] =
        useState(false);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const [formData, setFormData] =
        useState({

            type: "",
            location: "",
            description: "",
            media: [],

            latitude: "",
            longitude: "",

        });

    // Auto fetch GPS location
    useEffect(() => {

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                // Reverse Geocoding
                try {

                    const response =
                        await fetch(

                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

                        );

                    const data =
                        await response.json();

                    const address =
                        data.address || {};

                    const areaName =

                        address.suburb ||

                        address.neighbourhood ||

                        address.city ||

                        address.town ||

                        address.village ||

                        address.county ||

                        address.state_district ||

                        address.state ||

                        "Current Location";

                    setFormData((prev) => ({

                        ...prev,

                        latitude,
                        longitude,

                        location:
                            areaName,

                    }));

                } catch (error) {

                    console.error(error);

                }

            },

            (error) => {

                console.error(error);

                alert(
                    "Location access denied."
                );

            }

        );

    }, []);

    // Handle input changes
    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:
                e.target.value,

        });

    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Prevent exceeding 3 files total
        const totalFiles = formData.media.length + files.length;
        if (totalFiles > 3) {
            alert("Maximum 3 files allowed total.");
            e.target.value = "";
            return;
        }

        setFormData({
            ...formData,
            media: [...formData.media, ...files],
        });
    };

    // Submit report
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            // We will do AI classification AFTER uploading media

            // Upload media
            let mediaUrls = [];

            if (formData.media.length > 0) {

                for (const file of formData.media) {

                    const mediaData =
                        new FormData();

                    mediaData.append(
                        "file",
                        file
                    );

                    mediaData.append(

                        "upload_preset",

                        import.meta.env
                            .VITE_CLOUDINARY_UPLOAD_PRESET

                    );

                    const response =
                        await fetch(

                            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,

                            {

                                method: "POST",

                                body: mediaData,

                            }

                        );

                    const data =
                        await response.json();

                    mediaUrls.push(
                        data.secure_url
                    );

                }

            }

            // AI classification with Vision
            const aiResult =
                await classifyEmergency(
                    formData.description,
                    mediaUrls
                );

            const finalSeverity =
                aiResult.severity ||
                "PENDING";
            
            const assignedDepartment =
                aiResult.department ||
                "Police";

            // Save report
            await addDoc(

                collection(db, "reports"),

                {

                    type:
                        formData.type,

                    location:
                        formData.location,

                    description:
                        formData.description,

                    severity:
                        finalSeverity,
                    
                    department:
                        assignedDepartment,

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

            // Trigger Twilio SMS for CRITICAL emergencies
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

            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (cameraInputRef.current) cameraInputRef.current.value = "";

        } catch (error) {

            console.error(error);

            alert(
                "Failed to submit report"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen flex justify-center items-center px-4 py-12 relative">

            <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/10 relative z-10">

                <h1 className="text-5xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 drop-shadow-sm">

                    Report Emergency

                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* Type */}
                    <div>

                        <label className="block mb-2 text-gray-300 font-medium">

                            Disaster Type

                        </label>

                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            required
                        >

                            <option value="">
                                Select Type
                            </option>

                            <option value="Flood">
                                Flood
                            </option>

                            <option value="Fire">
                                Fire
                            </option>

                            <option value="Accident">
                                Accident
                            </option>

                            <option value="Earthquake">
                                Earthquake
                            </option>

                        </select>

                    </div>

                    {/* Location */}
                    <div>

                        <label className="block mb-2 text-gray-300 font-medium">

                            Location

                        </label>

                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            required
                        />

                    </div>

                    {/* Description */}
                    <div>

                        <label className="block mb-2 text-gray-300 font-medium">

                            Description

                        </label>

                        <textarea
                            name="description"
                            placeholder="Describe the emergency in detail..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                            required
                        />

                    </div>

                    {/* Media Upload Options */}
                    <div>
                        <label className="block mb-3 text-gray-300 font-medium">
                            Media Evidence (Max 3 Files)
                        </label>
                        
                        {/* Hidden Inputs */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={handleMediaChange}
                        />
                        
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*,video/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleMediaChange}
                        />

                        {/* Custom Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="flex-1 bg-slate-800/80 hover:bg-slate-700 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 transition font-semibold"
                            >
                                <span className="text-2xl">📁</span>
                                Upload Gallery
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current.click()}
                                className="flex-1 bg-red-600/80 hover:bg-red-500 p-4 rounded-xl border border-red-400/30 flex flex-col items-center justify-center gap-2 transition font-semibold shadow-lg shadow-red-900/20"
                            >
                                <span className="text-2xl">📷</span>
                                Live Camera
                            </button>
                        </div>
                        
                        {/* Media Preview / Count */}
                        {formData.media.length > 0 && (
                            <div className="mt-3 text-sm font-semibold text-green-400">
                                ✅ {formData.media.length} file(s) ready for upload
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-premium mt-8 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 p-4 rounded-xl font-bold text-xl shadow-lg shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {

                            loading
                                ? "Submitting securely..."
                                : "Submit Report"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default Report;