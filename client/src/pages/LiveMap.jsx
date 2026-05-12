import { useEffect, useState } from "react";

import MapPopup from
    "../components/MapPopup";

import {
    sendVerificationVote,
} from "../services/verificationService";

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

    // Verify Incident
    const verifyIncident = async (
        reportId,
        voteType
    ) => {

        try {

            // Get already voted reports
            const votedReports = JSON.parse(

                localStorage.getItem(
                    "votedReports"
                ) || "[]"

            );

            // Prevent duplicate voting
            if (votedReports.includes(reportId)) {

                alert(
                    "You already voted for this incident."
                );

                return;

            }

            // Send vote to backend
            const data =
                await sendVerificationVote(

                    reportId,
                    voteType

                );



            // Store vote locally
            votedReports.push(reportId);

            localStorage.setItem(
                "votedReports",
                JSON.stringify(votedReports)
            );

        } catch (error) {

            console.error(error);

        }

    };

    // Fetch reports realtime
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

            {reports.length === 0 && (

                <div className="bg-slate-800 p-5 rounded-2xl text-center mb-6 text-gray-300">

                    No active incidents found right now.

                </div>

            )}

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

                {reports.map((report) => (

                    <Marker
                        key={report.id}
                        position={[
                            report.latitude || 18.5204,
                            report.longitude || 73.8567,
                        ]}
                    >

                        <Popup>

                            <MapPopup

                                report={report}

                                verifyIncident={
                                    verifyIncident
                                }

                            />

                        </Popup>

                    </Marker>

                ))}

            </MapContainer>

        </div>

    );

}

export default LiveMap;