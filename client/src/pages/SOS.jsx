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

    const sendSOS = async () => {

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

            // Get user location (with permission check + longer timeout)
            const getLocation = () => new Promise((resolve, reject) => {
                // If Permissions API is available, check first for a clearer UX
                if (navigator.permissions && navigator.permissions.query) {
                    navigator.permissions.query({ name: 'geolocation' }).then((perm) => {
                        if (perm.state === 'denied') {
                            reject({ code: 1, message: 'Location permission denied' });
                            return;
                        }
                        // Ask for location
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 20000,
                            maximumAge: 0,
                        });
                    }).catch(() => {
                        // Fallback to direct getCurrentPosition if Permissions API unavailable or errors
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 20000,
                            maximumAge: 0,
                        });
                    });
                } else {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 20000,
                        maximumAge: 0,
                    });
                }
            });

            try {
                const position = await getLocation();

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

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

            } catch (error) {
                console.error("SOS ERROR:", error);
                setLoading(false);

                // Friendly, actionable messages
                if (error && error.code === 1) {
                    alert("Location permission denied. Please enable location permissions for this site and try again.");
                } else if (error && error.code === 2) {
                    alert("Location unavailable. Try moving to an open area or check device location settings.");
                } else if (error && error.code === 3) {
                    alert("Location request timed out. Please ensure your device has a location source (GPS/Wi‑Fi) and try again.");
                } else {
                    alert("Location access failed. Please enable location services and try again.");
                }

                return;
            }

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
                    <label htmlFor="police-checkbox" className="flex items-center gap-3 text-lg">

                        <input
                            id="police-checkbox"
                            name="police"
                            type="checkbox"
                            value="Police"
                            onChange={handleServiceChange}
                        />

                        🚓 Police

                    </label>

                    {/* Ambulance */}
                    <label htmlFor="ambulance-checkbox" className="flex items-center gap-3 text-lg">

                        <input
                            id="ambulance-checkbox"
                            name="ambulance"
                            type="checkbox"
                            value="Ambulance"
                            onChange={handleServiceChange}
                        />

                        🚑 Ambulance

                    </label>

                    {/* Fire Brigade */}
                    <label htmlFor="fire-checkbox" className="flex items-center gap-3 text-lg">

                        <input
                            id="fire-checkbox"
                            name="fire"
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