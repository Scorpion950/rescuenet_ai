import { useEffect, useState } from "react";

import {
    collection,
    onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

function Admin() {

    const [reports, setReports] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);

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

                        {report.imageUrl && (

                            <img
                                src={report.imageUrl}
                                alt="Disaster"
                                className="mt-4 rounded-xl w-full max-h-80 object-cover"
                            />

                        )}

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Admin;