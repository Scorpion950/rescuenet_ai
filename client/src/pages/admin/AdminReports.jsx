import { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";

const SEVERITY_CONFIG = {
    CRITICAL: { color: "bg-red-500/20 text-red-300 border-red-500/40", dot: "bg-red-500" },
    HIGH:     { color: "bg-orange-500/20 text-orange-300 border-orange-500/40", dot: "bg-orange-500" },
    MEDIUM:   { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40", dot: "bg-yellow-400" },
    LOW:      { color: "bg-slate-500/20 text-slate-300 border-slate-500/40", dot: "bg-slate-400" },
};

const STATUS_CONFIG = {
    "VERIFIED & LIVE": { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    "PENDING":         { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    "RESOLVED":        { color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
    "NOT SURE":        { color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
};

function AdminReports() {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [deletingId, setDeletingId] = useState(null);

    const deleteReport = async (id) => {
        if (!window.confirm("Delete this incident report permanently?")) return;
        setDeletingId(id);
        try {
            await deleteDoc(doc(db, "reports", id));
            toast.success("Report deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete report");
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "reports"),
            (snapshot) => {
                const fetched = [];
                snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
                fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setReports(fetched);
            },
            (error) => {
                console.error("Firestore Reports snapshot error:", error);
                toast.error("Real-time feed failed. Check your network.", { duration: 8000 });
            }
        );
        return () => unsubscribe();
    }, []);

    const filters = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "PENDING", "VERIFIED & LIVE", "RESOLVED"];
    const filtered = filter === "ALL" ? reports : reports.filter(r => r.severity === filter || r.status === filter);

    return (
        <div className="min-h-screen p-6 md:p-10 text-white">

            {/* Header */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">RescueNet AI — Admin</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">Incident Reports</h1>
                </div>
                <div className="glass-panel px-5 py-2.5 rounded-xl border border-white/10 text-center">
                    <p className="text-2xl font-black text-blue-400">{reports.length}</p>
                    <p className="text-xs text-slate-400">Total Reports</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {filters.map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${filter === f
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40"
                            : "bg-slate-800/60 border-white/10 text-slate-400 hover:border-blue-500/40 hover:text-white"}`}>
                        {f}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-16 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-2xl font-bold text-slate-300">No reports found</h2>
                    <p className="text-slate-500 mt-2">Try a different filter or wait for new incidents.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in-up">
                    {filtered.map((report) => (
                        <ReportCard key={report.id} report={report} deleteReport={deleteReport} deletingId={deletingId} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReportCard({ report, deleteReport, deletingId }) {
    const [showMap, setShowMap] = useState(false);
    const hasCoords = report.latitude != null && report.longitude != null;
    const sevCfg = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.LOW;
    const statusCfg = STATUS_CONFIG[report.status] || { color: "bg-slate-500/20 text-slate-400 border-slate-500/30" };

    return (
        <div className="glass-panel rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 overflow-hidden flex flex-col">

            {/* Color top strip by severity */}
            <div className={`h-1 w-full ${sevCfg.dot}`}></div>

            <div className="p-6 flex flex-col gap-4 flex-1">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-extrabold text-white">{report.type}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {report.createdAt?.seconds
                                ? new Date(report.createdAt.seconds * 1000).toLocaleString("en-IN", { hour12: true, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                                : "Unknown time"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${sevCfg.color}`}>
                            {report.severity}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
                            {report.status}
                        </span>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 rounded-xl px-3 py-2 border border-white/5">
                    <span>📍</span>
                    <span className="truncate">{report.location || "Unknown location"}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{report.description}</p>

                {/* Department */}
                {report.department && (
                    <span className="self-start text-xs font-bold px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                        🚔 {report.department}
                    </span>
                )}

                {/* Votes */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { label: "Yes", val: report.verifiedYes || 0, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
                        { label: "No", val: report.verifiedNo || 0, color: "text-red-400 bg-red-500/10 border-red-500/30" },
                        { label: "Unsure", val: report.verifiedUnsure || 0, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
                    ].map(v => (
                        <span key={v.label} className={`text-xs font-bold px-3 py-1 rounded-full border ${v.color}`}>
                            {v.label}: {v.val}
                        </span>
                    ))}
                </div>

                {/* Media */}
                {report.mediaUrls?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {report.mediaUrls.slice(0, 2).map((item, i) => {
                            const url = typeof item === "string" ? item : item?.url;
                            const isVideo = item?.type === "video" || url?.match(/\.(mp4|webm|mov)$/i);
                            return isVideo ? (
                                <video key={i} controls className="rounded-xl w-full max-h-32 object-cover bg-black/30 cursor-pointer" onClick={(e) => { e.preventDefault(); window.open(url, '_blank'); }}>
                                    <source src={url} />
                                </video>
                            ) : (
                                <img key={i} src={url} alt="Evidence" className="rounded-xl w-full h-24 object-cover bg-black/30 cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => { e.preventDefault(); window.open(url, '_blank'); }} />
                            );
                        })}
                        {report.mediaUrls.length > 2 && (
                            <span className="text-xs text-slate-500 col-span-2">+{report.mediaUrls.length - 2} more files</span>
                        )}
                    </div>
                )}

                {/* Map toggle */}
                {hasCoords && (
                    <div>
                        <button onClick={() => setShowMap(p => !p)}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${showMap ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : "bg-slate-800/60 text-slate-400 border-white/10 hover:border-blue-500/30"}`}>
                            {showMap ? "▲ Hide Map" : "📍 View on Map"}
                        </button>
                        {showMap && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-blue-500/20">
                                <div className="bg-slate-900/90 px-3 py-1.5 flex justify-between items-center">
                                    <span className="text-xs font-mono text-slate-500">{Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}</span>
                                    <a href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300">Open Maps ↗</a>
                                </div>
                                <iframe title={`map-${report.id}`} width="100%" height="200" loading="lazy"
                                    style={{ border: 0, display: "block" }}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${report.longitude - 0.01}%2C${report.latitude - 0.01}%2C${report.longitude + 0.01}%2C${report.latitude + 0.01}&layer=mapnik&marker=${report.latitude}%2C${report.longitude}`} />
                            </div>
                        )}
                    </div>
                )}

                {/* Delete */}
                <button onClick={() => deleteReport(report.id)} disabled={deletingId === report.id}
                    className="mt-auto w-full py-2.5 rounded-xl font-bold text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                    {deletingId === report.id ? "Deleting…" : "🗑 Delete Report"}
                </button>
            </div>
        </div>
    );
}

export default AdminReports;