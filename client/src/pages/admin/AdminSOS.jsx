import {
    useEffect,
    useState,
} from "react";

import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
} from "firebase/firestore";

import { db } from "../../firebase";

function AdminSOS() {

    const [sosAlerts, setSosAlerts] =
        useState([]);

    // Delete SOS
    const deleteSOS = async (id) => {

        try {

            await deleteDoc(

                doc(
                    db,
                    "sosAlerts",
                    id
                )

            );

            alert(
                "SOS alert deleted successfully"
            );

        } catch (error) {

            console.error(error);

            alert(
                "Failed to delete SOS alert"
            );

        }

    };

    // Realtime SOS Alerts
    useEffect(() => {

        const unsubscribe =
            onSnapshot(

                collection(
                    db,
                    "sosAlerts"
                ),

                (snapshot) => {

                    const fetchedAlerts = [];

                    snapshot.forEach((doc) => {

                        fetchedAlerts.push({

                            id: doc.id,

                            ...doc.data(),

                        });

                    });
                    
                    fetchedAlerts.sort((a, b) => {
                        const timeA = a.createdAt?.seconds || 0;
                        const timeB = b.createdAt?.seconds || 0;
                        return timeB - timeA;
                    });

                    setSosAlerts(
                        fetchedAlerts
                    );

                }

            );

        return () => unsubscribe();

    }, []);

    return (

        <div className="p-8 min-h-screen bg-mesh text-white relative">
            <div className="absolute inset-0 bg-black/40 z-0"></div>
            
            <div className="relative z-10">
                <h1 className="text-6xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500 drop-shadow-lg">

                    SOS Management

                </h1>

            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 animate-fade-in-up">

                {sosAlerts.length === 0 ? (

                    <div className="glass-panel p-10 rounded-3xl text-center text-gray-300 shadow-2xl border border-white/10 break-inside-avoid">

                        <h2 className="text-2xl font-bold">No active SOS alerts.</h2>

                    </div>

                ) : (

                    sosAlerts.map((alert) => (

                        <div

                            key={alert.id}

                            className="glass-panel p-8 rounded-3xl shadow-2xl border border-red-500/40 relative overflow-hidden group break-inside-avoid"

                        >
                            {/* Animated Background Glow */}
                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">

                                <span className="text-3xl">

                                    🚨

                                </span>

                                <h2 className="text-2xl font-bold">

                                    Emergency SOS Alert

                                </h2>

                            </div>

                            {/* Requested Services */}
                            <div className="mb-4">

                                <p className="font-bold text-lg mb-2">

                                    Requested Services:

                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {alert.services?.map((service) => (

                                        <span

                                            key={service}

                                            className="bg-red-600/80 px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg shadow-red-900/30 border border-red-500/30"

                                        >

                                            {service}

                                        </span>

                                    ))}

                                </div>

                            </div>

                            {/* Location */}
                            <div className="mb-4">

                                <p className="font-bold">

                                    Location:

                                </p>

                                <p>

                                    {alert.location || "Unknown Area"}

                                </p>

                            </div>

                            {/* Assigned Stations */}
                            <div className="mb-4">

                                <p className="font-bold mb-2">

                                    Assigned Stations:

                                </p>

                                <div className="space-y-2">

                                    {alert.assignedStations?.map(

                                        (station, index) => (

                                            <div

                                                key={index}

                                                className="bg-slate-900/50 p-4 rounded-xl border border-white/5"

                                            >

                                                <p className="font-semibold text-lg text-blue-300">

                                                    {station.name}

                                                </p>

                                                <p className="text-sm text-gray-400">

                                                    {station.type}

                                                </p>

                                                <p className="text-sm text-gray-400">

                                                    {station.distance} KM away

                                                </p>

                                            </div>

                                        )

                                    )}

                                </div>

                            </div>

                            {/* Timestamp */}
                            <div className="mb-4">

                                <p className="font-bold">

                                    Reported At:

                                </p>

                                <p>

                                    {

                                        alert.createdAt?.seconds

                                            ? new Date(

                                                alert.createdAt.seconds * 1000

                                            ).toLocaleString()

                                            : "Unknown Time"

                                    }

                                </p>

                            </div>

                            {/* Delete */}
                            <button

                                onClick={() =>
                                    deleteSOS(alert.id)
                                }

                                className="btn-premium w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-red-900/50"

                            >

                                Delete SOS Alert

                            </button>

                        </div>

                    ))

                )}

            </div>
            </div>

        </div>

    );

}

export default AdminSOS;