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

                    setSosAlerts(
                        fetchedAlerts
                    );

                }

            );

        return () => unsubscribe();

    }, []);

    return (

        <div>

            <h1 className="text-5xl font-bold text-red-500 mb-8">

                SOS Management

            </h1>

            <div className="grid gap-6">

                {sosAlerts.length === 0 ? (

                    <div className="bg-slate-800 p-6 rounded-2xl text-center text-gray-300">

                        No active SOS alerts.

                    </div>

                ) : (

                    sosAlerts.map((alert) => (

                        <div

                            key={alert.id}

                            className="bg-red-700 p-6 rounded-2xl shadow-lg"

                        >

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

                                            className="bg-black px-3 py-1 rounded-xl"

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

                                                className="bg-black p-3 rounded-xl"

                                            >

                                                <p className="font-semibold">

                                                    {station.name}

                                                </p>

                                                <p className="text-sm text-gray-300">

                                                    {station.type}

                                                </p>

                                                <p className="text-sm text-gray-300">

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

                                className="bg-black hover:bg-gray-900 px-5 py-2 rounded-xl font-bold"

                            >

                                Delete SOS

                            </button>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}

export default AdminSOS;