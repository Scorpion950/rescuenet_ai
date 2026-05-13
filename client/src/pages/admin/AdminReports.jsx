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

function AdminReports() {

    const [reports, setReports] =
        useState([]);

    // Delete Report
    const deleteReport = async (id) => {

        try {

            await deleteDoc(

                doc(
                    db,
                    "reports",
                    id
                )

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

    return (

        <div>

            <h1 className="text-5xl font-bold text-blue-400 mb-8">

                Incident Reports

            </h1>

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

                            {/* Type */}
                            <h2 className="text-2xl font-bold text-red-400 mb-3">

                                {report.type}

                            </h2>

                            {/* Location */}
                            <p>

                                <span className="font-bold">

                                    Location:

                                </span>{" "}

                                {report.location}

                            </p>

                            {/* Severity */}
                            <p>

                                <span className="font-bold">

                                    Severity:

                                </span>{" "}

                                {report.severity}

                            </p>

                            {/* Description */}
                            <p className="mt-3 text-gray-300">

                                {report.description}

                            </p>

                            {/* Verification Votes */}
                            <div className="mt-4 flex flex-wrap gap-4">

                                <div className="bg-green-700 px-4 py-2 rounded-xl">

                                    ✅ Yes:
                                    {" "}
                                    {report.verifiedYes || 0}

                                </div>

                                <div className="bg-red-700 px-4 py-2 rounded-xl">

                                    ❌ No:
                                    {" "}
                                    {report.verifiedNo || 0}

                                </div>

                                <div className="bg-yellow-600 px-4 py-2 rounded-xl">

                                    🤔 Unsure:
                                    {" "}
                                    {report.verifiedUnsure || 0}

                                </div>

                            </div>

                            {/* Status */}
                            <div className="mt-4">

                                <span className="font-bold">

                                    Status:

                                </span>{" "}

                                {report.status}

                            </div>

                            {/* Media */}
                            {report.mediaUrls &&
                                report.mediaUrls.length > 0 && (

                                    <div className="mt-5 space-y-4">

                                        {report.mediaUrls.map(

                                            (media, index) => (

                                                media.includes(".mp4") ||

                                                    media.includes(".webm") ||

                                                    media.includes(".mov")

                                                    ? (

                                                        <video

                                                            key={index}

                                                            controls

                                                            className="rounded-xl w-full h-64 object-cover"

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

                                                            className="rounded-xl w-full h-64 object-cover"

                                                        />

                                                    )

                                            )

                                        )}

                                    </div>

                                )}

                            {/* Timestamp */}
                            <div className="mt-5">

                                <span className="font-bold">

                                    Reported At:

                                </span>{" "}

                                {

                                    report.createdAt?.seconds

                                        ? new Date(

                                            report.createdAt.seconds * 1000

                                        ).toLocaleString()

                                        : "Unknown Time"

                                }

                            </div>

                            {/* Delete */}
                            <button

                                onClick={() =>
                                    deleteReport(report.id)
                                }

                                className="mt-6 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl font-bold"

                            >

                                Delete Report

                            </button>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}

export default AdminReports;