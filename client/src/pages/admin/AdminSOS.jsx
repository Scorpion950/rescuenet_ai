import { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";

const SERVICE_CONFIG = {
    "Police": { color: "bg-blue-600/20 text-blue-300 border-blue-500/30", icon: "🚓" },
    "Ambulance": { color: "bg-rose-600/20 text-rose-300 border-rose-500/30", icon: "🚑" },
    "Fire Brigade": { color: "bg-orange-600/20 text-orange-300 border-orange-500/30", icon: "🚒" },
};

function AdminSOS() {
    const [sosAlerts, setSosAlerts] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    const deleteSOS = async (id) => {
        if (!window.confirm("Delete this SOS alert permanently?")) return;
        setDeletingId(id);
        try {
            await deleteDoc(doc(db, "sosAlerts", id));
            toast.success("SOS alert removed");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete SOS alert");
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "sosAlerts"),
            (snapshot) => {
                const fetchedAlerts = [];
                snapshot.forEach((doc) => fetchedAlerts.push({ id: doc.id, ...doc.data() }));
                fetchedAlerts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setSosAlerts(fetchedAlerts);
            },
            (error) => {
                console.error("Firestore SOS snapshot error:", error);
                toast.error("Real-time feed failed. Check your network.", { duration: 8000 });
            }
        );
        return () => unsubscribe();
    }, []);

    const active = sosAlerts.filter(a => a.status !== "RESOLVED");
    const resolved = sosAlerts.filter(a => a.status === "RESOLVED");

    return (
        <div className="min-h-screen p-6 md:p-10 text-white">

            {/* Header */}
            <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">RescueNet AI — Dispatch</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">SOS Management</h1>
                </div>
                <div className="flex gap-3">
                    <div className="glass-panel px-5 py-2.5 rounded-xl border border-red-500/30 text-center">
                        <p className="text-2xl font-black text-red-400">{active.length}</p>
                        <p className="text-xs text-slate-400">Active</p>
                    </div>
                    <div className="glass-panel px-5 py-2.5 rounded-xl border border-white/10 text-center">
                        <p className="text-2xl font-black text-slate-300">{resolved.length}</p>
                        <p className="text-xs text-slate-400">Resolved</p>
                    </div>
                </div>
            </div>

            {sosAlerts.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-16 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-slate-300">No active SOS alerts</h2>
                    <p className="text-slate-500 mt-2">All clear. Real-time monitoring is active.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in-up">
                    {sosAlerts.map((alert) => {
                        const isResolved = alert.status === "RESOLVED";
                        return (
                            <div key={alert.id}
                                className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${isResolved ? "border-white/10 opacity-60" : "border-red-500/40 emergency-glow"}`}>

                                {/* Top bar */}
                                <div className={`px-6 py-3 flex items-center justify-between ${isResolved ? "bg-slate-800/50" : "bg-red-900/30"}`}>
                                    <div className="flex items-center gap-2">
                                        {!isResolved && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                                            {isResolved ? "RESOLVED" : "ACTIVE SOS"}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {alert.createdAt?.seconds
                                            ? new Date(alert.createdAt.seconds * 1000).toLocaleString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })
                                            : "—"}
                                    </span>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Services */}
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Services Requested</p>
                                        <div className="flex flex-wrap gap-2">
                                            {alert.services?.map((s) => {
                                                const cfg = SERVICE_CONFIG[s] || { color: "bg-slate-700/50 text-slate-300 border-white/10", icon: "🚨" };
                                                return (
                                                    <span key={s} className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.color}`}>
                                                        {cfg.icon} {s}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3 border border-white/5">
                                        <span className="text-lg mt-0.5">📍</span>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Location</p>
                                            <p className="font-semibold text-slate-200">{alert.location || "Unknown Area"}</p>
                                            {alert.latitude && alert.longitude && (
                                                <a href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
                                                    View on Maps →
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Assigned Stations */}
                                    {alert.assignedStations?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Assigned Stations</p>
                                            <div className="space-y-2">
                                                {alert.assignedStations.map((station, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-2.5 border border-white/5">
                                                        <div>
                                                            <p className="text-sm font-semibold text-blue-300">{station.name}</p>
                                                            <p className="text-xs text-slate-500">{station.type}</p>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                                                            {station.distance} km
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Delete */}
                                    <button
                                        onClick={() => deleteSOS(alert.id)}
                                        disabled={deletingId === alert.id}
                                        className="w-full py-3 rounded-xl font-bold text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                                    >
                                        {deletingId === alert.id ? "Removing…" : "🗑 Remove Alert"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminSOS;