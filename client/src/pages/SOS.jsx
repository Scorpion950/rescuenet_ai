import {
    useState,
} from "react";

import {
    sendSOSRequest,
} from "../services/sosService";

function SOS() {

    const [loading, setLoading] =
        useState(false);

    const [

        selectedServices,

        setSelectedServices,

    ] = useState([]);

    const handleServiceChange = (e) => {

        const service =
            e.target.value;

        // Checkbox selected
        if (e.target.checked) {

            setSelectedServices([

                ...selectedServices,

                service,

            ]);

        }

        // Checkbox removed
        else {

            setSelectedServices(

                selectedServices.filter(

                    (item) =>
                        item !== service

                )

            );

        }

    };

    const sendSOS = async (service) => {

        try {

            // Validation
            if (

                selectedServices.length === 0

            ) {

                alert(

                    "Please select at least one emergency service."

                );

                return;

            }

            setLoading(true);

            // Get user location
            navigator.geolocation.getCurrentPosition(

                async (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    // Reverse Geocoding
                    const geoResponse =
                        await fetch(

                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

                        );

                    const geoData =
                        await geoResponse.json();

                    const address =
                        geoData.address || {};

                    const location =

                        address.suburb ||

                        address.neighbourhood ||

                        address.city ||

                        address.town ||

                        address.village ||

                        address.county ||

                        address.state_district ||

                        address.state ||

                        "Unknown Area";

                    // Send SOS to backend
                    const data =
                        await sendSOSRequest(

                            selectedServices,
                            latitude,
                            longitude,
                            location

                        );

                    // Error
                    if (data.error) {

                        alert(data.error);

                        setLoading(false);

                        return;

                    }

                    // Success
                    alert(data.message);

                    // Reset selected services
                    setSelectedServices([]);

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

            <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md">

                <h2 className="text-2xl font-bold mb-6 text-center">

                    Select Emergency Services

                </h2>

                <div className="space-y-4">

                    {/* Police */}
                    <label className="flex items-center gap-3 text-lg">

                        <input
                            type="checkbox"
                            value="Police"
                            onChange={handleServiceChange}
                        />

                        🚓 Police

                    </label>

                    {/* Ambulance */}
                    <label className="flex items-center gap-3 text-lg">

                        <input
                            type="checkbox"
                            value="Ambulance"
                            onChange={handleServiceChange}
                        />

                        🚑 Ambulance

                    </label>

                    {/* Fire Brigade */}
                    <label className="flex items-center gap-3 text-lg">

                        <input
                            type="checkbox"
                            value="Fire Brigade"
                            onChange={handleServiceChange}
                        />

                        🚒 Fire Brigade

                    </label>

                </div>

                <button

                    onClick={sendSOS}

                    disabled={loading}

                    className="w-full bg-red-600 hover:bg-red-700 p-4 rounded-xl text-xl font-bold mt-6"

                >

                    {

                        loading
                            ? "Sending..."
                            : "Send Emergency SOS"

                    }

                </button>

            </div>

        </div>

    );

}

export default SOS;