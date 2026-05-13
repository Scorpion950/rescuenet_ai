import {
    useEffect,
    useState,
} from "react";

import LiveMap from "./LiveMap";

import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";

function Admin() {

    const [reports, setReports] =
        useState([]);

    const [sosAlerts, setSosAlerts] =
        useState([]);

    // Delete Report
    const deleteReport = async (id) => {

        try {

            await deleteDoc(
                doc(db, "reports", id)
            );

            alert(
                "Report deleted successfully"
            );

        } catch (error) {

            console.error(error);

            alert(
                "Failed to delete report"
            );

        }

    };

    // Delete SOS
    const deleteSOS = async (id) => {

        try {

            await deleteDoc(
                doc(db, "sosAlerts", id)
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

    // Realtime Reports
    useEffect(() => {

        const unsubscribe =
            onSnapshot(

                collection(
                    db,
                    "reports"
                ),

                (snapshot) => {

                    const fetchedReports = [];

                    snapshot.forEach((doc) => {

                        fetchedReports.push({

                            id: doc.id,

                            ...doc.data(),

                        });

                    });

                    setReports(
                        fetchedReports
                    );

                }

            );

        return () => unsubscribe();

    }, []);

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

        <div className="p-6">

            {/* Admin Title */}
            <h1 className="text-5xl font-bold mb-10">

                Admin Dashboard

            </h1>

            {/* Live Map */}
            <div className="mb-14">

                <LiveMap />

            </div>

            {/* SOS SECTION */}
            <div className="mb-14">

                <h2 className="text-4xl font-bold text-red-500 mb-6">

                    Live SOS Alerts

                </h2>

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

            {/* REPORTS SECTION */}
            <div>

                <h2 className="text-4xl font-bold text-blue-400 mb-6">

                    Disaster Reports

                </h2>

                <div className="grid gap-6">

                    {reports.length === 0 ? (

                        <div className="bg-slate-800 p-6 rounded-2xl text-center text-gray-300">

                            No disaster reports available.

                        </div>

                    ) : (

                        reports.map((report) => (

                            <div

                                key={report.id}

                                className="bg-slate-800 p-6 rounded-2xl shadow-lg"

                            >

                                <h2 className="text-2xl font-bold text-red-400 mb-3">

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

                                <p className="mt-3 text-gray-300">

                                    {report.description}

                                </p>

                                {/* Media */}
                                {report.mediaUrls &&
                                    report.mediaUrls.length > 0 && (

                                        <div className="mt-4 space-y-3">

                                            {report.mediaUrls.map(

                                                (media, index) => (

                                                    media.includes(".mp4") ||

                                                        media.includes(".webm") ||

                                                        media.includes(".mov")

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

                                {/* Delete */}
                                <button

                                    onClick={() =>
                                        deleteReport(report.id)
                                    }

                                    className="mt-5 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl font-bold"

                                >

                                    Delete Report

                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>

    );

}

export default Admin;