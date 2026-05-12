import { useEffect, useState } from "react";

import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";

function Admin() {

    const [reports, setReports] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);

    const deleteReport = async (id) => {

        try {

            await deleteDoc(doc(db, "reports", id));

            alert("Report deleted successfully");

        } catch (error) {

            console.error(error);

            alert("Failed to delete report");

        }

    };

    const deleteSOS = async (id) => {

        try {

            await deleteDoc(doc(db, "sosAlerts", id));

            alert("SOS alert deleted successfully");

        } catch (error) {

            console.error(error);

            alert("Failed to delete SOS alert");

        }

    };

    // Realtime Reports
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

    // Realtime SOS Alerts
    useEffect(() => {

        const unsubscribe = onSnapshot(
            collection(db, "sosAlerts"),
            (snapshot) => {

                const fetchedAlerts = [];

                snapshot.forEach((doc) => {

                    fetchedAlerts.push({
                        id: doc.id,
                        ...doc.data(),
                    });

                });

                setSosAlerts(fetchedAlerts);

            }
        );

        return () => unsubscribe();

    }, []);

    return (
        <div className="p-6">

            <h1 className="text-4xl font-bold mb-6">
                Admin Dashboard
            </h1>

            {/* SOS Alerts Section */}
            <h2 className="text-3xl font-bold text-red-500 mb-4">
                Live SOS Alerts
            </h2>

            <div className="grid gap-4 mb-10">

                {sosAlerts.map((alert) => (

                    <div
                        key={alert.id}
                        className="bg-red-700 p-5 rounded-2xl shadow-lg"
                    >

                        <h3 className="text-2xl font-bold">
                            🚨 {alert.service}
                        </h3>

                        <p className="text-gray-200 mt-2">
                            Emergency assistance requested
                        </p>

                        <button
                            onClick={() => deleteSOS(alert.id)}
                            className="mt-4 bg-black hover:bg-gray-900 px-4 py-2 rounded-xl font-bold"
                        >
                            Delete SOS
                        </button>

                    </div>

                ))}

            </div>

            {/* Reports Section */}
            <h2 className="text-3xl font-bold text-blue-400 mb-4">
                Disaster Reports
            </h2>

            <div className="grid gap-6">

                {reports.map((report) => (

                    <div
                        key={report.id}
                        className="bg-slate-800 p-6 rounded-2xl shadow-lg"
                    >

                        <h2 className="text-2xl font-bold text-red-400 mb-2">
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

                        <p className="mt-2 text-gray-300">
                            {report.description}
                        </p>

                        <button
                            onClick={() => deleteReport(report.id)}
                            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold"
                        >
                            Delete Report
                        </button>

                        {/* Media Gallery */}
                        {report.mediaUrls &&
                            report.mediaUrls.length > 0 && (

                                <div className="mt-4 space-y-3">

                                    {report.mediaUrls.map(
                                        (media, index) => (

                                            media.includes(
                                                ".mp4"
                                            ) ||

                                                media.includes(
                                                    ".webm"
                                                ) ||

                                                media.includes(
                                                    ".mov"
                                                )

                                                ? (

                                                    <video
                                                        key={index}
                                                        controls
                                                        className="rounded-xl w-full h-48 object-cover"
                                                    >

                                                        <source
                                                            src={media}
                                                        />

                                                    </video>

                                                )

                                                : (

                                                    <img
                                                        key={index}
                                                        src={media}
                                                        alt="Disaster"
                                                        className="rounded-xl w-full h-48 object-cover"
                                                    />

                                                )

                                        )
                                    )}

                                </div>

                            )}

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Admin;