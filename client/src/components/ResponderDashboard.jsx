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

import toast from "react-hot-toast";

function ResponderDashboard({

    responderType,

}) {

    const [incidents, setIncidents] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

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

    // Loading State
    if (loading) {

        return (

            <div className="min-h-screen flex justify-center items-center text-white text-2xl">

                Loading Dashboard...

            </div>

        );

    }

    return (

        <div className="p-6 text-white">

            <h1 className="text-5xl font-bold mb-8">

                {responderType} Dashboard

            </h1>

            <div className="grid gap-6">

                {incidents.length === 0 ? (

                    <div className="bg-slate-800 p-10 rounded-2xl text-center text-gray-300 shadow-xl">

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

                            className="bg-slate-800 p-6 rounded-2xl shadow-lg"

                        >

                            {/* Services */}
                            <div className="mb-4">

                                <p className="font-bold mb-2">

                                    Services Requested:

                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {incident.services?.map((service) => (

                                        <span

                                            key={service}

                                            className="bg-red-700 px-3 py-1 rounded-xl"

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

                                    {incident.location || "Unknown Area"}

                                </p>

                            </div>

                            {/* Stations */}
                            <div className="mb-4">

                                <p className="font-bold mb-2">

                                    Assigned Stations:

                                </p>

                                <div className="space-y-2">

                                    {incident.assignedStations?.map(

                                        (station, index) => (

                                            <div

                                                key={index}

                                                className="bg-black p-3 rounded-xl"

                                            >

                                                <p className="font-semibold">

                                                    {station.name}

                                                </p>

                                                <p className="text-sm text-gray-300">

                                                    {station.distance} KM away

                                                </p>

                                            </div>

                                        )

                                    )}

                                </div>

                            </div>

                            {/* Status */}
                            <div className="mb-4">

                                <span className="font-bold">

                                    Status:

                                </span>{" "}

                                <span

                                    className={

                                        incident.status === "RESOLVED"

                                            ? "bg-green-600 px-3 py-1 rounded-full text-sm font-bold"

                                            : incident.status === "DEPLOYED"

                                                ? "bg-blue-600 px-3 py-1 rounded-full text-sm font-bold"

                                                : "bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold"

                                    }

                                >

                                    {incident.status || "PENDING"}

                                </span>

                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 mb-4">

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

                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold transition"

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

                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-bold transition"

                                >

                                    Resolve

                                </button>

                            </div>

                            {/* Time */}
                            <div>

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