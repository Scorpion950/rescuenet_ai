import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function Report() {

    const [formData, setFormData] = useState({
        type: "",
        location: "",
        severity: "",
        description: "",
    });

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

            await addDoc(collection(db, "reports"), {
                ...formData,
                createdAt: new Date(),
            });

            alert("Incident Report Submitted!");

            setFormData({
                type: "",
                location: "",
                severity: "",
                description: "",
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

                    {/* Severity */}
                    <div>
                        <label className="block mb-2">
                            Severity
                        </label>

                        <select
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            className="w-full p-3 rounded-xl bg-slate-700 text-white"
                            required
                        >
                            <option value="">Select Severity</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
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