import { useEffect, useState } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
} from "react-leaflet";

import {
    collection,
    getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

function LiveMap() {

    const [reports, setReports] = useState([]);

    // Fetch reports from Firebase
    useEffect(() => {

        const fetchReports = async () => {

            try {

                const querySnapshot = await getDocs(
                    collection(db, "reports")
                );

                const fetchedReports = [];

                querySnapshot.forEach((doc) => {

                    fetchedReports.push({
                        id: doc.id,
                        ...doc.data(),
                    });

                });

                setReports(fetchedReports);

            } catch (error) {

                console.error(error);

            }

        };

        fetchReports();

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
                            18.5204 + (index * 0.5),
                            73.8567 + (index * 0.5),
                        ]}
                    >

                        <Popup>

                            <div>

                                <h2 className="font-bold text-lg">
                                    {report.type}
                                </h2>

                                <p>
                                    Location: {report.location}
                                </p>

                                <p>
                                    Severity: {report.severity}
                                </p>

                                <p>
                                    {report.description}
                                </p>

                            </div>

                        </Popup>

                    </Marker>

                ))}

            </MapContainer>

        </div>
    );
}

export default LiveMap;