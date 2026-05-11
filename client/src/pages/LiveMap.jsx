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
} from "firebase/firestore";

import { db } from "../firebase";

function LiveMap() {

    const [reports, setReports] = useState([]);

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