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
                        <div className="glass-panel p-6 rounded-2xl">
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
                        <div className="glass-panel p-8 rounded-2xl text-center text-gray-400">
                            No nearby emergency alerts right now. Stay safe!
                        </div>
                    )
                }
            </div>

            {/* Hero Section */}
            <div className="flex flex-col justify-center items-center text-center h-[70vh]">
                <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent drop-shadow-lg">
                    AI-Powered <br/> Disaster Response
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-10 leading-relaxed font-light">
                    Report emergencies instantly, view live danger zones,
                    and empower responders to act faster during critical situations.
                </p>

                <div className="flex flex-wrap gap-6 justify-center">
                    <button
                        onClick={() => navigate("/report")}
                        className="btn-premium bg-red-600/90 backdrop-blur-sm border border-red-500/50 hover:bg-red-500 px-8 py-4 rounded-2xl text-xl font-bold shadow-lg shadow-red-900/50 flex items-center gap-2"
                    >
                        🚨 Report Emergency
                    </button>
                    <button
                        onClick={() => navigate("/livemap")}
                        className="btn-premium glass-panel hover:bg-white/10 px-8 py-4 rounded-2xl text-xl font-bold flex items-center gap-2"
                    >
                        🗺️ View Live Map
                    </button>
                    <button
                        onClick={() => navigate("/sos")}
                        className="btn-premium bg-orange-600/90 backdrop-blur-sm border border-orange-500/50 hover:bg-orange-500 px-8 py-4 rounded-2xl text-xl font-bold shadow-lg shadow-orange-900/50 flex items-center gap-2"
                    >
                        🚑 Emergency SOS
                    </button>
                </div>
            </div>

        </div>

    );

}

export default Home;