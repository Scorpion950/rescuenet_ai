import {
    useEffect,
    useState,
} from "react";

import {
    API_BASE_URL,
} from "../utils/constants";

import {
    updateIncidentStatus,
} from "../services/statusService";

import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

import toast from "react-hot-toast";

function ResponderDashboard({

    responderType,

}) {

    const [incidents, setIncidents] =
        useState([]);

    const [loading, setLoading] =
        useState(true);
    
    // For real-time toasts without overriding backend logic
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Fetch incidents
    useEffect(() => {

        const fetchIncidents = async () => {

            try {

                const response =

                    await fetch(

                        `${API_BASE_URL}/responder-incidents/${responderType}`,

                        {

                            headers: {

                                "x-responder-key":

                                    localStorage.getItem(
                                        "responderType"
                                    ),

                            },

                        }

                    );

                const data =
                    await response.json();

                setIncidents(
                    data.incidents || []
                );

            }

            catch (error) {

                console.error(error);

                toast.error(
                    "Failed to load incidents"
                );

            }

            finally {

                setLoading(false);

            }

        };

        fetchIncidents();

    }, [responderType]);

    // Real-time notification listener
    useEffect(() => {
        const q = query(
            collection(db, "reports"),
            where("department", "==", responderType)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!isInitialLoad) {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const newIncident = change.doc.data();
                        toast.error(`🚨 NEW EMERGENCY ASSIGNED: ${newIncident.type || 'Incident'}!`, {
                            duration: 10000,
                            position: 'top-right',
                            style: {
                                background: '#333',
                                color: '#fff',
                                fontWeight: 'bold'
                            }
                        });
                        // Wait a moment and refetch the full incident list from backend
                        // to get distances and assigned stations logic
                        setTimeout(() => {
                            fetch(`${API_BASE_URL}/responder-incidents/${responderType}`, {
                                headers: { "x-responder-key": localStorage.getItem("responderType") }
                            }).then(res => res.json()).then(data => {
                                setIncidents(data.incidents || []);
                            }).catch(console.error);
                        }, 1000);
                    }
                });
            }
            setIsInitialLoad(false);
        });

        return () => unsubscribe();
    }, [isInitialLoad, responderType]);

    // Loading State
    if (loading) {

        return (

            <div className="min-h-screen flex justify-center items-center text-white text-2xl">

                Loading Dashboard...

            </div>

        );

    }

    return (

        <div className="p-6 text-white min-h-screen">

            <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">

                {responderType} Dashboard

            </h1>

            <div className="grid gap-6">

                {incidents.length === 0 ? (

                    <div className="glass-panel p-10 rounded-3xl text-center text-gray-300 shadow-2xl border border-white/10">

                        <h2 className="text-2xl font-bold mb-3">

                            No Active Incidents

                        </h2>

                        <p>

                            Everything looks safe right now.

                        </p>

                    </div>

                ) : (

                    incidents.map((incident) => (

                        <div

                            key={incident.id}

                            className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10"

                        >

                            {/* Services */}
                            <div className="mb-4">

                                <p className="font-bold mb-2 text-gray-400">

                                    Services Requested:

                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {incident.services?.map((service) => (

                                        <span

                                            key={service}

                                            className="bg-red-600/80 px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg shadow-red-900/30"

                                        >

                                            {service}

                                        </span>

                                    ))}

                                </div>

                            </div>

                            {/* Location */}
                            <div className="mb-4">

                                <p className="font-bold text-gray-400">

                                    Location:

                                </p>

                                <p className="text-xl font-medium">

                                    {incident.location || "Unknown Area"}

                                </p>

                            </div>

                            {/* Stations */}
                            <div className="mb-6">

                                <p className="font-bold mb-2 text-gray-400">

                                    Assigned Stations:

                                </p>

                                <div className="space-y-3">

                                    {incident.assignedStations?.map(

                                        (station, index) => (

                                            <div

                                                key={index}

                                                className="bg-slate-900/50 p-4 rounded-xl border border-white/5"

                                            >

                                                <p className="font-semibold text-lg text-blue-300">

                                                    {station.name}

                                                </p>

                                                <p className="text-sm text-gray-400">

                                                    {station.distance} KM away

                                                </p>

                                            </div>

                                        )

                                    )}

                                </div>

                            </div>

                            {/* Status */}
                            <div className="mb-6 flex items-center gap-3">

                                <span className="font-bold text-gray-400">

                                    Status:

                                </span>

                                <span

                                    className={

                                        incident.status === "RESOLVED"

                                            ? "bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-green-900/20"

                                            : incident.status === "DEPLOYED"

                                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20"

                                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-yellow-900/20"

                                    }

                                >

                                    {incident.status || "PENDING"}

                                </span>

                            </div>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-4 mb-6">

                                <button

                                    onClick={async () => {

                                        await updateIncidentStatus(

                                            incident.id,

                                            "DEPLOYED"

                                        );

                                        setIncidents((prev) =>

                                            prev.map((item) =>

                                                item.id === incident.id

                                                    ? {

                                                        ...item,

                                                        status: "DEPLOYED",

                                                    }

                                                    : item

                                            )

                                        );

                                        toast.success(
                                            "Incident Deployed"
                                        );

                                    }}

                                    className="btn-premium flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-900/50"

                                >

                                    Deploy

                                </button>

                                <button

                                    onClick={async () => {

                                        await updateIncidentStatus(

                                            incident.id,

                                            "RESOLVED"

                                        );

                                        setIncidents((prev) =>

                                            prev.map((item) =>

                                                item.id === incident.id

                                                    ? {

                                                        ...item,

                                                        status: "RESOLVED",

                                                    }

                                                    : item

                                            )

                                        );

                                        toast.success(
                                            "Incident Resolved"
                                        );

                                    }}

                                    className="btn-premium flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-green-900/50"

                                >

                                    Resolve

                                </button>

                                {/* Get Directions Button */}
                                {incident.latitude && incident.longitude && (
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-premium flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-purple-900/50 text-center flex items-center justify-center gap-2"
                                    >
                                        🗺️ Get Directions
                                    </a>
                                )}

                            </div>

                            {/* Time */}
                            <div className="text-gray-400 text-sm">

                                <span className="font-bold">

                                    Reported At:

                                </span>{" "}

                                {

                                    incident.createdAt?.seconds

                                        ? new Date(

                                            incident.createdAt.seconds * 1000

                                        ).toLocaleString()

                                        : "Unknown Time"

                                }

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}

export default ResponderDashboard;