import React, {
    useEffect,
    useState,
} from "react";

function Home() {

    const [nearbyAlerts, setNearbyAlerts] =
        useState([]);

    useEffect(() => {

        navigator.geolocation.watchPosition(

            async (position) => {

                try {

                    const response = await fetch(
                        "http://localhost:5000/nearby-incidents",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({

                                latitude:
                                    position.coords.latitude,

                                longitude:
                                    position.coords.longitude,

                            }),

                        }
                    );

                    const data =
                        await response.json();

                    setNearbyAlerts(
                        data.incidents || []
                    );

                } catch (error) {

                    console.error(error);

                }

            }

        );

    }, []);

    return (

        <div className="px-6 py-10">

            {/* Nearby Alerts */}
            {nearbyAlerts.length > 0 && (

                <div className="bg-red-700 p-5 rounded-2xl mb-8">

                    <h2 className="text-2xl font-bold mb-4">
                        🚨 Nearby Emergency Alerts
                    </h2>

                    <div className="space-y-4">

                        {nearbyAlerts.map((alert) => (

                            <div
                                key={alert.id}
                                className="bg-red-800 p-4 rounded-xl"
                            >

                                <h3 className="font-bold text-lg">
                                    {alert.type}
                                </h3>

                                <p>
                                    {alert.location}
                                </p>

                                <p>
                                    Severity:
                                    {" "}
                                    {alert.severity}
                                </p>

                                <p>
                                    Distance:
                                    {" "}
                                    {alert.distance} KM
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            )}

            {/* Hero Section */}
            <div className="flex flex-col justify-center items-center text-center h-[70vh]">

                <h1 className="text-5xl font-bold mb-6">
                    AI-Powered Disaster Response Platform
                </h1>

                <p className="text-xl text-gray-300 max-w-2xl mb-8">
                    Report emergencies, view live danger zones, and help responders act faster during critical situations.
                </p>

                <div className="space-x-4">

                    <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-lg font-semibold">
                        Report Emergency
                    </button>

                    <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg font-semibold">
                        View Live Map
                    </button>

                </div>

            </div>

        </div>

    );
}

export default Home;