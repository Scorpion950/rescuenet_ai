import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function AdminOverview() {
    const [reports, setReports] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);

    const seenReportIds = useRef(new Set());
    const seenSosIds = useRef(new Set());
    const reportsInitial = useRef(true);
    const sosInitial = useRef(true);

    // Live Reports listener
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "reports"),
            (snapshot) => {
                const fetchedReports = [];
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        if (reportsInitial.current) {
                            seenReportIds.current.add(change.doc.id);
                        } else if (!seenReportIds.current.has(change.doc.id)) {
                            seenReportIds.current.add(change.doc.id);
                            const d = change.doc.data();
                            toast(`🚨 New ${d.severity || ""} ${d.type || "Incident"} report!`, {
                                duration: 6000,
                                position: "top-right",
                                style: { background: "#1e293b", color: "#fff", fontWeight: "bold", border: "1px solid rgba(239,68,68,0.4)" },
                                icon: "🚨",
                            });
                        }
                    }
                });
                snapshot.forEach((doc) => fetchedReports.push({ id: doc.id, ...doc.data() }));
                setReports(fetchedReports);
                reportsInitial.current = false;
            },
            (error) => {
                console.error("Firestore Reports snapshot error:", error);
                toast.error("Real-time connection failed. Check your network or disable ad-blocker.", { duration: 8000 });
            }
        );
        return () => unsubscribe();
    }, []);

    // Live SOS listener
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "sosAlerts"),
            (snapshot) => {
                const fetchedAlerts = [];
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        if (sosInitial.current) {
                            seenSosIds.current.add(change.doc.id);
                        } else if (!seenSosIds.current.has(change.doc.id)) {
                            seenSosIds.current.add(change.doc.id);
                            toast("🆘 NEW SOS ALERT TRIGGERED!", {
                                duration: 10000,
                                position: "top-right",
                                style: { background: "#7f1d1d", color: "#fff", fontWeight: "bold", border: "1px solid rgba(239,68,68,0.6)" },
                            });
                        }
                    }
                });
                snapshot.forEach((doc) => fetchedAlerts.push({ id: doc.id, ...doc.data() }));
                setSosAlerts(fetchedAlerts);
                sosInitial.current = false;
            },
            (error) => {
                console.error("Firestore SOS snapshot error:", error);
                toast.error("SOS real-time feed failed.", { duration: 8000 });
            }
        );
        return () => unsubscribe();
    }, []);

    const severeReports = reports.filter(r => r.severity === "HIGH" || r.severity === "CRITICAL");
    const verifiedReports = reports.filter(r => r.status === "VERIFIED & LIVE");
    const pendingReports = reports.filter(r => r.status === "PENDING");
    const activeSOS = sosAlerts.filter(s => s.status !== "RESOLVED");

    const statCards = [
        { label: "Total Reports", value: reports.length, color: "from-blue-500 to-cyan-400", border: "border-blue-500/30", icon: "📋" },
        { label: "Active SOS", value: activeSOS.length, color: "from-red-500 to-rose-400", border: "border-red-500/40", icon: "🆘" },
        { label: "Severe Incidents", value: severeReports.length, color: "from-amber-400 to-orange-400", border: "border-amber-500/30", icon: "⚠️" },
        { label: "Verified & Live", value: verifiedReports.length, color: "from-emerald-400 to-green-400", border: "border-emerald-500/30", icon: "✅" },
    ];

    const systemStatus = [
        { label: "Firebase Realtime DB", status: "ACTIVE", ok: true },
        { label: "Incident Monitoring", status: "RUNNING", ok: true },
        { label: "SOS Dispatch System", status: "ACTIVE", ok: true },
        { label: "AI Classification (Gemini 2.0)", status: "ONLINE", ok: true },
        { label: "SMS Alerts (Twilio)", status: "ACTIVE", ok: true },
    ];

    return (
        <div className="min-h-screen p-6 md:p-10 text-white">

            {/* Header */}
            <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">RescueNet AI — Command Center</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                        System Overview
                    </h1>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-emerald-400 text-sm font-bold">LIVE</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-10">
                {statCards.map((s) => (
                    <div key={s.label} className={`glass-panel p-6 rounded-2xl border ${s.border} hover:scale-[1.02] transition-transform duration-200`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{s.icon}</span>
                            <span className={`text-4xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                                {s.value}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-400">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* System Status */}
                <div className="glass-panel p-8 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-6 text-slate-200 flex items-center gap-2">
                        <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse inline-block"></span>
                        System Status
                    </h2>
                    <div className="space-y-4">
                        {systemStatus.map((s) => (
                            <div key={s.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <span className="text-slate-300 text-sm font-medium">{s.label}</span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.ok ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
                                    {s.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel p-8 rounded-2xl border border-white/10">
                    <h2 className="text-xl font-bold mb-6 text-slate-200">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { to: "/admin/reports", label: "View All Reports", sub: `${reports.length} total · ${pendingReports.length} pending`, color: "from-blue-600 to-blue-700", icon: "📋" },
                            { to: "/admin/sos", label: "Manage SOS Alerts", sub: `${activeSOS.length} active alerts`, color: "from-red-600 to-red-700", icon: "🆘" },
                            { to: "/admin/map", label: "Live Incident Map", sub: "Real-time geographic view", color: "from-indigo-600 to-purple-700", icon: "🗺️" },
                        ].map((a) => (
                            <Link key={a.to} to={a.to}
                                className={`btn-premium flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${a.color} hover:opacity-90 transition-all`}>
                                <span className="text-2xl">{a.icon}</span>
                                <div>
                                    <p className="font-bold text-white">{a.label}</p>
                                    <p className="text-xs text-white/60">{a.sub}</p>
                                </div>
                                <span className="ml-auto text-white/50">→</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminOverview;