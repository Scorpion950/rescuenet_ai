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

                    fetchedReports.sort((a, b) => {
                        const timeA = a.createdAt?.seconds || 0;
                        const timeB = b.createdAt?.seconds || 0;
                        return timeB - timeA;
                    });

                    setReports(
                        fetchedReports
                    );

                }

            );

        return () => unsubscribe();

    }, []);

    return (

        <div className="p-8 min-h-screen bg-mesh text-white relative">
            <div className="absolute inset-0 bg-black/40 z-0"></div>
            
            <div className="relative z-10">
                <h1 className="text-6xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 drop-shadow-lg">

                    Incident Reports

                </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start animate-fade-in-up">

                {reports.length === 0 ? (

                    <div className="glass-panel p-10 rounded-3xl text-center text-gray-300 shadow-2xl border border-white/10 break-inside-avoid">

                        <h2 className="text-2xl font-bold">No disaster reports available.</h2>

                    </div>

                ) : (

                    reports.map((report) => (

                        <div

                            key={report.id}

                            className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-blue-500/30 transition-colors duration-300 break-inside-avoid"

                        >

                            {/* Type */}
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">

                                    {report.type}

                                </h2>
                                {report.department && (
                                    <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20">
                                        {report.department}
                                    </span>
                                )}
                            </div>

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
                            <div className="mt-6 flex flex-wrap gap-4">

                                <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-green-900/20">

                                    ✅ Yes:
                                    {" "}
                                    {report.verifiedYes || 0}

                                </div>

                                <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-900/20">

                                    ❌ No:
                                    {" "}
                                    {report.verifiedNo || 0}

                                </div>

                                <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-yellow-900/20">

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

                                                media.includes("/video/")

                                                    ? (

                                                        <video

                                                            key={index}

                                                            controls

                                                            className="rounded-xl w-full max-h-96 object-contain bg-black/20"

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

                                                            className="rounded-xl w-full max-h-96 object-contain bg-black/20"

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

                                className="btn-premium mt-8 w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-red-900/50"

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

export default AdminReports;