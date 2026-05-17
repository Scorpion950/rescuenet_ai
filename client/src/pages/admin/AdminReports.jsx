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

    const [reports, setReports] = useState([]);

    const deleteReport = async (id) => {
        try {
            await deleteDoc(doc(db, "reports", id));
            alert("Report deleted successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to delete report");
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "reports"),
            (snapshot) => {
                const fetchedReports = [];
                snapshot.forEach((doc) => {
                    fetchedReports.push({ id: doc.id, ...doc.data() });
                });
                fetchedReports.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
                setReports(fetchedReports);
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
                            <ReportCard
                                key={report.id}
                                report={report}
                                deleteReport={deleteReport}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Per-card component so each card has its own map toggle state ──────────────
function ReportCard({ report, deleteReport }) {
    const [showMap, setShowMap] = useState(false);
    const hasCoords = report.latitude != null && report.longitude != null;

    return (
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-blue-500/30 transition-colors duration-300 break-inside-avoid">

            {/* Header — Type + Department */}
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

            {/* Location name */}
            <p>
                <span className="font-bold">Location:</span>{" "}{report.location}
            </p>

            {/* Severity */}
            <p>
                <span className="font-bold">Severity:</span>{" "}{report.severity}
            </p>

            {/* Description */}
            <p className="mt-3 text-gray-300">{report.description}</p>

            {/* Verification votes */}
            <div className="mt-6 flex flex-wrap gap-4">
                <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-green-900/20">
                    ✅ Yes: {report.verifiedYes || 0}
                </div>
                <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-900/20">
                    ❌ No: {report.verifiedNo || 0}
                </div>
                <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-yellow-900/20">
                    🤔 Unsure: {report.verifiedUnsure || 0}
                </div>
            </div>

            {/* Status */}
            <div className="mt-4">
                <span className="font-bold">Status:</span>{" "}{report.status}
            </div>

            {/* ── LOCATION MAP ─────────────────────────────────────────────── */}
            <div className="mt-5">
                {hasCoords ? (
                    <>
                        {/* Toggle button */}
                        <button
                            onClick={() => setShowMap((prev) => !prev)}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border ${
                                showMap
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-inner"
                                    : "bg-slate-800/60 text-slate-300 border-white/10 hover:bg-slate-700/60 hover:border-blue-500/30"
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            {showMap ? "Hide Map" : "📍 View on Map"}
                        </button>

                        {/* Expandable map panel */}
                        {showMap && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-blue-500/30 shadow-xl shadow-blue-900/20">
                                {/* Coords bar + Google Maps link */}
                                <div className="bg-slate-900/90 px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
                                    <span className="text-xs font-mono text-slate-400">
                                        📍 {Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)}
                                    </span>
                                    <a
                                        href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Open in Google Maps ↗
                                    </a>
                                </div>

                                {/* OSM iframe — no eval, no CSP risk */}
                                <iframe
                                    title={`map-${report.id}`}
                                    width="100%"
                                    height="220"
                                    loading="lazy"
                                    style={{ border: 0, display: "block" }}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${report.longitude - 0.01}%2C${report.latitude - 0.01}%2C${report.longitude + 0.01}%2C${report.latitude + 0.01}&layer=mapnik&marker=${report.latitude}%2C${report.longitude}`}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    /* No GPS fallback */
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-800/40 px-4 py-2.5 rounded-xl border border-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        No GPS coordinates recorded
                    </div>
                )}
            </div>
            {/* ─────────────────────────────────────────────────────────────── */}

            {/* Media */}
            {report.mediaUrls && report.mediaUrls.length > 0 && (
                <div className="mt-5 space-y-4">
                    {report.mediaUrls.map((media, index) =>
                        media.includes("/video/") ? (
                            <video key={index} controls className="rounded-xl w-full max-h-96 object-contain bg-black/20">
                                <source src={media} />
                            </video>
                        ) : (
                            <img key={index} src={media} alt="Disaster" className="rounded-xl w-full max-h-96 object-contain bg-black/20" />
                        )
                    )}
                </div>
            )}

            {/* Timestamp */}
            <div className="mt-5">
                <span className="font-bold">Reported At:</span>{" "}
                {report.createdAt?.seconds
                    ? new Date(report.createdAt.seconds * 1000).toLocaleString()
                    : "Unknown Time"}
            </div>

            {/* Delete */}
            <button
                onClick={() => deleteReport(report.id)}
                className="btn-premium mt-8 w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-red-900/50"
            >
                Delete Report
            </button>
        </div>
    );
}

export default AdminReports;