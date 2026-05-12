import {
    useState,
} from "react";

import {
    sendSOSRequest,
} from "../services/sosService";
function SOS() {

    const [loading, setLoading] =
        useState(false);

    const sendSOS = async (service) => {

        try {

            setLoading(true);

            // Get user location
            navigator.geolocation.getCurrentPosition(

                async (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    // Send SOS to backend
                    const data =
                        await sendSOSRequest(

                            service,
                            latitude,
                            longitude

                        );

                    // Error
                    if (data.error) {

                        alert(data.error);

                        setLoading(false);

                        return;

                    }

                    // Success
                    alert(data.message);

                    setLoading(false);

                },

                // Location Error
                (error) => {

                    console.error(error);

                    setLoading(false);

                    alert(
                        "Location access failed"
                    );

                },

                // Faster Location Options
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 60000,
                }

            );

        } catch (error) {

            console.error(error);

            setLoading(false);

            alert("Failed to send SOS");

        }

    };

    return (

        <div className="min-h-screen flex flex-col justify-center items-center gap-8">

            <h1 className="text-5xl font-bold text-red-500">
                Emergency SOS
            </h1>

            <div className="flex flex-wrap gap-6 justify-center">

                <button
                    onClick={() => sendSOS("Ambulance")}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 px-10 py-5 rounded-2xl text-2xl font-bold disabled:opacity-50"
                >

                    {
                        loading
                            ? "Sending..."
                            : "🚑 Ambulance"
                    }

                </button>

                <button
                    onClick={() => sendSOS("Fire Brigade")}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700 px-10 py-5 rounded-2xl text-2xl font-bold disabled:opacity-50"
                >

                    {
                        loading
                            ? "Sending..."
                            : "🚒 Fire Brigade"
                    }

                </button>

                <button
                    onClick={() => sendSOS("Police")}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 px-10 py-5 rounded-2xl text-2xl font-bold disabled:opacity-50"
                >

                    {
                        loading
                            ? "Sending..."
                            : "🚓 Police"
                    }

                </button>

            </div>

        </div>

    );

}

export default SOS;