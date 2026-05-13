import {
    useEffect,
    useState,
} from "react";

import {

    updateIncidentStatus,

} from "../services/statusService";

function ResponderDashboard({

    responderType,

}) {

    const [incidents, setIncidents] =
        useState([]);

    // Fetch incidents
    useEffect(() => {

        fetch(

            `http://localhost:5000/responder/${responderType}`

        )

            .then((res) => res.json())

            .then((data) => {

                setIncidents(
                    data.incidents || []
                );

            })

            .catch(console.error);

    }, [responderType]);

    return (

        <div className="p-6">

            <h1 className="text-5xl font-bold mb-8">

                {responderType} Dashboard

            </h1>

            <div className="grid gap-6">

                {incidents.length === 0 ? (

                    <div className="bg-slate-800 p-6 rounded-2xl text-center text-gray-300">

                        No active incidents assigned.

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

                                    {incident.location}

                                </p>

                            </div>

                            {/* Assigned Stations */}
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

                                <span className="text-yellow-400 font-bold">

                                    {incident.status || "PENDING"}

                                </span>

                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mb-4">

                                <button

                                    onClick={async () => {

                                        await updateIncidentStatus(

                                            incident.id,

                                            "DEPLOYED"

                                        );

                                        window.location.reload();

                                    }}

                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold"

                                >

                                    Deploy

                                </button>

                                <button

                                    onClick={async () => {

                                        await updateIncidentStatus(

                                            incident.id,

                                            "RESOLVED"

                                        );

                                        window.location.reload();

                                    }}

                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-bold"

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