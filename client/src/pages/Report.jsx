import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { classifyEmergency } from "../utils/ai";




function Report() {

    const [formData, setFormData] = useState({
        type: "",
        location: "",
        severity: "",
        description: "",
        image: null,
        latitude: "",
        longitude: "",
    });

    useEffect(() => {

        navigator.geolocation.getCurrentPosition(

            (position) => {

                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
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
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            // AI classification
            const aiSeverity = await classifyEmergency(
                formData.description
            );

            // Upload image to Cloudinary
            let imageUrl = "";

            if (formData.image) {

                const imageData = new FormData();

                imageData.append(
                    "file",
                    formData.image
                );

                imageData.append(
                    "upload_preset",
                    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
                );

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: imageData,
                    }
                );

                const data = await response.json();

                imageUrl = data.secure_url;

            }

            // Store in Firebase
            await addDoc(collection(db, "reports"), {
                type: formData.type,
                location: formData.location,
                description: formData.description,
                severity: aiSeverity,
                imageUrl,
                latitude: formData.latitude,
                longitude: formData.longitude,

                // Verification System
                verifiedYes: 0,
                verifiedNo: 0,
                verifiedUnsure: 0,
                status: "PENDING",

                createdAt: new Date(),
            });

            alert(`Incident Report Submitted! AI Severity: ${aiSeverity}`);

            // Reset form
            setFormData({
                type: "",
                location: "",
                severity: "",
                description: "",
                image: null,
                latitude: formData.latitude,
                longitude: formData.longitude,
            });

        } catch (error) {

            console.error(error);

            alert("Failed to submit report");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center px-4">

            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-2xl">

                <h1 className="text-4xl font-bold mb-6 text-center text-red-500">
                    Report Emergency
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">

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
                            <option value="">Select Type</option>
                            <option value="Flood">Flood</option>
                            <option value="Fire">Fire</option>
                            <option value="Accident">Accident</option>
                            <option value="Earthquake">Earthquake</option>
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

                    {/* Image Upload */}
                    <div>

                        <label className="block mb-2">
                            Upload Disaster Image
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    image: e.target.files[0],
                                })
                            }
                            className="w-full p-3 rounded-xl bg-slate-700 text-white"
                        />

                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-semibold text-lg"
                    >
                        Submit Report
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Report;