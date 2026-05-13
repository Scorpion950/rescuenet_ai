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

function Report() {

    const [loading, setLoading] =
        useState(false);

    const fileInputRef =
        useRef(null);

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

    // Submit report
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            // AI classification
            const aiResult =
                await classifyEmergency(
                    formData.description
                );

            const finalSeverity =

                aiResult.severity ||
                "PENDING";

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
            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }

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

        <div className="min-h-screen flex justify-center items-center px-4">

            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-2xl">

                <h1 className="text-4xl font-bold mb-6 text-center text-red-500">

                    Report Emergency

                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Type */}
                    <div>

                        <label className="block mb-2">

                            Disaster Type

                        </label>

                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-3 rounded-xl bg-slate-700 text-white"
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

                        <label className="block mb-2">

                            Location

                        </label>

                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full p-3 rounded-xl bg-slate-700 text-white"
                            required
                        />

                    </div>

                    {/* Description */}
                    <div>

                        <label className="block mb-2">

                            Description

                        </label>

                        <textarea
                            name="description"
                            placeholder="Describe the emergency"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            className="w-full p-3 rounded-xl bg-slate-700 text-white"
                            required
                        />

                    </div>

                    {/* Upload */}
                    <div>

                        <label className="block mb-2">

                            Upload Images / Videos

                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple

                            onChange={(e) => {

                                const files =
                                    Array.from(
                                        e.target.files
                                    );

                                if (files.length > 3) {

                                    alert(
                                        "Maximum 3 files allowed"
                                    );

                                    e.target.value = "";

                                    return;

                                }

                                setFormData({

                                    ...formData,

                                    media: files,

                                });

                            }}

                            className="w-full p-3 rounded-xl bg-slate-700 text-white"
                        />

                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-semibold text-lg disabled:opacity-50"
                    >

                        {

                            loading
                                ? "Submitting..."
                                : "Submit Report"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default Report;