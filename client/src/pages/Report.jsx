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
            severity: "",
            description: "",
            media: [],
            latitude: "",
            longitude: "",

        });

    useEffect(() => {

        navigator.geolocation.getCurrentPosition(

            (position) => {

                setFormData((prev) => ({

                    ...prev,

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,

                }));

            },

            (error) => {

                console.error(error);

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

    // Handle form submit
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
                aiResult.severity;

            if (aiResult.error) {

                alert(
                    "AI analysis unavailable. Report will still be submitted."
                );

            }

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

                `Incident Report Submitted! AI Severity: ${finalSeverity}`

            );

            // Reset form
            setFormData({

                type: "",
                location: "",
                severity: "",
                description: "",
                media: [],

                latitude:
                    formData.latitude,

                longitude:
                    formData.longitude,

            });

            // Reset file input
            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }

            setLoading(false);

        } catch (error) {

            console.error(error);

            setLoading(false);

            alert(
                "Failed to submit report"
            );

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

                    {/* Disaster Type */}
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
                            placeholder="Enter location"
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

                    {/* Media Upload */}
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

                                // Max 3 files
                                if (files.length > 3) {

                                    alert(
                                        "Maximum 3 files allowed"
                                    );

                                    // Clear selected files
                                    e.target.value = "";

                                    setFormData({

                                        ...formData,

                                        media: [],

                                    });

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

                    {/* Submit Button */}
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