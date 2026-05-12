import { useEffect, useState } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
} from "react-leaflet";

import {
    collection,
    onSnapshot,
    updateDoc,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";

function LiveMap() {

    const [reports, setReports] = useState([]);

    const verifyIncident = async (
        reportId,
        voteType
    ) => {

        try {

            const response = await fetch(
                "http://localhost:5000/verify-incident",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        reportId,
                        voteType,
                    }),

                }
            );

            const data = await response.json();

            console.log(data);

        } catch (error) {

            console.error(error);

        }

    };

    // YES vote
    if (type === "yes") {

        updatedData.verifiedYes =
            (report.verifiedYes || 0) + 1;

    }

    // NO vote
    else if (type === "no") {

        updatedData.verifiedNo =
            (report.verifiedNo || 0) + 1;

    }

    // UNSURE vote
    else {

        updatedData.verifiedUnsure =
            (report.verifiedUnsure || 0) + 1;

    }

    // Verification Logic
    const yesVotes =
        updatedData.verifiedYes || report.verifiedYes || 0;

    const noVotes =
        updatedData.verifiedNo || report.verifiedNo || 0;

    // VERIFIED & LIVE
    if (yesVotes >= 3 && yesVotes > noVotes) {

        updatedData.status = "VERIFIED & LIVE";

    }

    // NOT SURE
    else if (noVotes >= yesVotes) {

        updatedData.status = "NOT SURE";

    }

    // PENDING
    else {

        updatedData.status = "PENDING";

    }

    await updateDoc(reportRef, updatedData);

} catch (error) {

    console.error(error);

}

    };

// Fetch reports from Firebase
useEffect(() => {

    const unsubscribe = onSnapshot(
        collection(db, "reports"),
        (snapshot) => {

            const fetchedReports = [];

            snapshot.forEach((doc) => {

                fetchedReports.push({
                    id: doc.id,
                    ...doc.data(),
                });

            });

            setReports(fetchedReports);

        }
    );

    return () => unsubscribe();

}, []);

return (
    <div className="p-6">

        <h1 className="text-4xl font-bold mb-6">
            Live Disaster Map
        </h1>

        <MapContainer
            center={[18.5204, 73.8567]}
            zoom={5}
            style={{
                height: "80vh",
                width: "100%",
            }}
        >

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Temporary Random Coordinates */}
            {reports.map((report, index) => (

                <Marker
                    key={report.id}
                    position={[
                        report.latitude || 18.5204,
                        report.longitude || 73.8567,
                    ]}
                >

                    <Popup>

                        <div className="w-64">

                            <h2 className="font-bold text-lg mb-2">
                                {report.type}
                            </h2>

                            <p>
                                <span className="font-bold">
                                    Location:
                                </span>{" "}
                                {report.location}
                            </p>

                            <p>
                                <span className="font-bold">
                                    Severity:
                                </span>{" "}
                                {report.severity}
                            </p>

                            <p className="mt-2">
                                {report.description}
                            </p>

                            <div className="mt-4 flex gap-2 flex-wrap">

                                <button
                                    onClick={() => verifyIncident(report.id, "yes")}
                                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg font-bold"
                                >
                                    ✅ Yes
                                </button>

                                <button
                                    onClick={() => verifyIncident(report.id, "no")}
                                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg font-bold"
                                >
                                    ❌ No
                                </button>

                                <button
                                    onClick={() => verifyIncident(report.id, "unsure")}
                                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg font-bold"
                                >
                                    🤔 Unsure
                                </button>

                            </div>

                            <div className="mt-4 text-sm">

                                <p>
                                    ✅ Yes: {report.verifiedYes || 0}
                                </p>

                                <p>
                                    ❌ No: {report.verifiedNo || 0}
                                </p>

                                <p>
                                    🤔 Unsure: {report.verifiedUnsure || 0}
                                </p>

                                <p className="mt-2 font-bold">
                                    Status: {report.status}
                                </p>

                            </div>

                            {report.imageUrl && (

                                <img
                                    src={report.imageUrl}
                                    alt="Disaster"
                                    className="mt-4 rounded-xl w-full h-40 object-cover"
                                />

                            )}

                        </div>

                    </Popup>

                </Marker>

            ))}

        </MapContainer>

    </div>
);
}

export default LiveMap;