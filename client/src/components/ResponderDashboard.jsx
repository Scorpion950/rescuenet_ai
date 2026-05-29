import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../utils/constants";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

const STATUS_STYLE = {
    RESOLVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    DEPLOYED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    PENDING:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const SERVICE_ICON = { "Police": "🚓", "Ambulance": "🚑", "Fire Brigade": "🚒" };

function ResponderDashboard({ responderType }) {

    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);

    const seenIds = useRef(new Set());
    const isInitialLoad = useRef(true);

    // Initial fetch
    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/responder-incidents/${responderType}`, {
                    headers: { "x-responder-key": localStorage.getItem("responderType") },
                });
                const data = await response.json();
                let list = data.incidents || [];
                list.sort((a, b) => (b.createdAt?._seconds || b.createdAt?.seconds || 0) - (a.createdAt?._seconds || a.createdAt?.seconds || 0));
                setIncidents(list);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load incidents");
            } finally {
                setLoading(false);
            }
        };
        fetchIncidents();
    }, [responderType]);

    // Real-time SOS listener
    useEffect(() => {
        const q = query(collection(db, "sosAlerts"), where("services", "array-contains", responderType));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const docId = change.doc.id;
                const data = change.doc.data();
                if (change.type === "added") {
                    if (isInitialLoad.current) {
                        seenIds.current.add(docId);
                    } else if (!seenIds.current.has(docId) && data.status !== "RESOLVED") {
                        seenIds.current.add(docId);
                        const label = (data.services || []).join(", ") || "Incident";
                        toast(`🚨 NEW EMERGENCY: ${label}!`, {
                            duration: 10000, position: "top-right",
                            style: { background: "#1e1a2e", color: "#fff", fontWeight: "bold", border: "1px solid rgba(239,68,68,0.4)" },
                        });
                        // Refetch
                        setTimeout(() => {
                            fetch(`${API_BASE_URL}/responder-incidents/${responderType}`, {
                                headers: { "x-responder-key": localStorage.getItem("responderType") },
                            }).then(r => r.json()).then(d => {
                                let list = d.incidents || [];
                                list.sort((a, b) => (b.createdAt?._seconds || b.createdAt?.seconds || 0) - (a.createdAt?._seconds || a.createdAt?.seconds || 0));
                                setIncidents(list);
                            }).catch(console.error);
                        }, 1000);
                    }
                }
            });
            isInitialLoad.current = false;
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            toast.error("Real-time alerts unavailable. Disable ad-blocker if active.", { duration: 8000 });
        });
        return () => unsubscribe();
    }, [responderType]);

    const doAction = async (incident, action) => {
        const incidentId = incident.id;
        setActioningId(incidentId + action);
        try {
            const response = await fetch(`${API_BASE_URL}/${action}-incident/${incidentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-responder-key": localStorage.getItem("responderType") },
                body: JSON.stringify({ source: incident.source || "sos" })
            });
            if (!response.ok) throw new Error(`Failed to ${action} incident`);

            if (action === "resolve") {
                setIncidents(prev => prev.filter(i => i.id !== incidentId));
                toast.success("Incident Resolved ✅");
            } else {
                setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, status: "DEPLOYED" } : i));
                toast.success("Units Deployed 🚓");
            }
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${action} incident. Try again.`);
        } finally {
            setActioningId(null);
        }
    };

    const pending   = incidents.filter(i => i.status === "PENDING");
    const deployed  = incidents.filter(i => i.status === "DEPLOYED");

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium">Loading dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-10 text-white">

            {/* Header */}
            <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">
                        {SERVICE_ICON[responderType] || "🚨"} Responder Portal
                    </p>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">{responderType} Dashboard</h1>
                </div>
                <div className="flex gap-3">
                    <div className="glass-panel px-5 py-2.5 rounded-xl border border-amber-500/30 text-center">
                        <p className="text-2xl font-black text-amber-400">{pending.length}</p>
                        <p className="text-xs text-slate-400">Pending</p>
                    </div>
                    <div className="glass-panel px-5 py-2.5 rounded-xl border border-blue-500/30 text-center">
                        <p className="text-2xl font-black text-blue-400">{deployed.length}</p>
                        <p className="text-xs text-slate-400">Deployed</p>
                    </div>
                </div>
            </div>

            {incidents.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-20 text-center animate-scale-in">
                    <div className="text-6xl mb-5">✅</div>
                    <h2 className="text-2xl font-bold text-slate-300">All clear</h2>
                    <p className="text-slate-500 mt-2">No active incidents. Real-time monitoring is running.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in-up stagger">
                    {incidents.map((incident) => (
                        <IncidentCard key={incident.id} incident={incident} onAction={doAction} actioningId={actioningId} />
                    ))}
                </div>
            )}
        </div>
    );
}

function IncidentCard({ incident, onAction, actioningId }) {
    const statusStyle = STATUS_STYLE[incident.status] || STATUS_STYLE.PENDING;
    const isPending   = incident.status === "PENDING" || !incident.status;
    const isActioning = (id) => actioningId === incident.id + id;

    return (
        <div className={`glass-panel rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${isPending ? "border-amber-500/30" : "border-white/10"}`}>

            {/* Status bar top */}
            <div className={`h-1 ${isPending ? "bg-amber-500" : incident.status === "DEPLOYED" ? "bg-blue-500" : "bg-emerald-500"}`}></div>

            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between bg-slate-900/50 border-b border-white/5">
                <div className="flex flex-wrap gap-1.5">
                    {incident.services?.map((svc) => (
                        <span key={svc} className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                            {SERVICE_ICON[svc] || "🚨"} {svc}
                        </span>
                    ))}
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle}`}>
                    {incident.status || "PENDING"}
                </span>
            </div>

            <div className="p-5 flex flex-col gap-4 flex-1">

                {/* Location */}
                <div className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3 border border-white/5">
                    <span className="text-lg mt-0.5">📍</span>
                    <div>
                        <p className="text-xs text-slate-500 mb-0.5">Incident Location</p>
                        <p className="font-semibold text-slate-100">{incident.location || "Unknown Area"}</p>
                    </div>
                </div>

                {/* Assigned Stations */}
                {incident.assignedStations?.length > 0 && (
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Assigned Stations</p>
                        <div className="space-y-2">
                            {incident.assignedStations.map((s, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-3 py-2.5 border border-white/5">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-300">{s.name}</p>
                                        <p className="text-xs text-slate-500">{s.type}</p>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg whitespace-nowrap">
                                        {s.distance} km
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-slate-600">
                    Reported: {incident.createdAt?.seconds
                        ? new Date(incident.createdAt.seconds * 1000).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })
                        : "Unknown time"}
                </p>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2.5">
                    <button onClick={() => onAction(incident, "deploy")}
                        disabled={!!actioningId}
                        className="btn-premium flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-900/40 disabled:opacity-50">
                        {isActioning("deploy") ? "…" : "Deploy"}
                    </button>
                    <button onClick={() => onAction(incident, "resolve")}
                        disabled={!!actioningId}
                        className="btn-premium flex-1 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-green-900/40 disabled:opacity-50">
                        {isActioning("resolve") ? "…" : "Resolve ✓"}
                    </button>
                </div>

                {/* Directions */}
                {incident.latitude && incident.longitude && (
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-premium text-center py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2">
                        🗺️ Get Directions
                    </a>
                )}
            </div>
        </div>
    );
}

export default ResponderDashboard;