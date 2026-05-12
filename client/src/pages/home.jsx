import {
    useNavigate,
} from "react-router-dom";

import AlertCard from
    "../components/AlertCard";

import useNearbyAlerts from
    "../hooks/useNearbyAlerts";

function Home() {

    const navigate =
        useNavigate();

    const nearbyAlerts =
        useNearbyAlerts();

    return (

        <div className="px-6 py-10">

            {/* Nearby Alerts */}
            <div className="mb-8">

                <h2 className="text-2xl font-bold mb-4">

                    🚨 Nearby Emergency Alerts

                </h2>

                {

                    nearbyAlerts.length > 0 ? (

                        <div className="bg-red-700 p-5 rounded-2xl">

                            <div className="space-y-4">

                                {nearbyAlerts.map((alert) => (

                                    <AlertCard

                                        key={alert.id}

                                        type={alert.type}
                                        severity={alert.severity}
                                        location={alert.location}
                                        status={alert.status}

                                    />

                                ))}

                            </div>

                        </div>

                    ) : (

                        <div className="bg-slate-800 p-6 rounded-2xl text-center text-gray-300">

                            No nearby emergency alerts right now.

                        </div>

                    )

                }

            </div>

            {/* Hero Section */}
            <div className="flex flex-col justify-center items-center text-center h-[70vh]">

                <h1 className="text-5xl font-bold mb-6">
                    AI-Powered Disaster Response Platform
                </h1>

                <p className="text-xl text-gray-300 max-w-2xl mb-8">

                    Report emergencies, view live danger zones,
                    and help responders act faster during
                    critical situations.

                </p>

                <div className="flex flex-wrap gap-4 justify-center">

                    <button

                        onClick={() =>
                            navigate("/report")
                        }

                        className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-lg font-semibold"
                    >

                        🚨 Report Emergency

                    </button>

                    <button

                        onClick={() =>
                            navigate("/livemap")
                        }

                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg font-semibold"
                    >

                        🗺️ View Live Map

                    </button>

                    <button

                        onClick={() =>
                            navigate("/sos")
                        }

                        className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl text-lg font-semibold"
                    >

                        🚑 Emergency SOS

                    </button>

                </div>

            </div>

        </div>

    );

}

export default Home;