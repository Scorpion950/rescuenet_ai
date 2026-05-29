import { useNavigate } from "react-router-dom";
import AlertCard from "../components/AlertCard";
import useNearbyAlerts from "../hooks/useNearbyAlerts";

function Home() {
    const navigate = useNavigate();
    const nearbyAlerts = useNearbyAlerts();

    const features = [
        { icon: "🤖", title: "AI Classification", desc: "Gemini 2.0 Flash analyzes and classifies every report for severity and department in real-time." },
        { icon: "🗺️", title: "Live Incident Map", desc: "Geospatial visualization of all active emergencies with real-time Firestore updates." },
        { icon: "📡", title: "Instant Dispatch", desc: "Automatically notifies the nearest police, ambulance, and fire stations the moment a report comes in." },
        { icon: "📱", title: "SMS Alerts", desc: "Residents within 5 km of an incident receive immediate Twilio SMS emergency notifications." },
    ];

    return (
        <div className="min-h-screen bg-mesh">

            {/* Nearby Alerts banner */}
            {nearbyAlerts.length > 0 && (
                <div className="px-6 pt-6 animate-slide-in">
                    <div className="max-w-4xl mx-auto glass-panel rounded-2xl border border-red-500/30 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Nearby Emergency Alerts
                        </p>
                        <div className="space-y-3">
                            {nearbyAlerts.map((alert) => (
                                <AlertCard key={alert.id} alert={alert} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero */}
            <div className="flex flex-col justify-center items-center text-center min-h-[88vh] px-6 py-20">

                {/* Live badge */}
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 px-4 py-1.5 rounded-full mb-8 animate-fade-in">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">System Operational</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-[1.05] text-balance animate-fade-in-up">
                    <span className="text-white">AI-Powered</span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-red-400 bg-clip-text text-transparent">
                        Disaster Response
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-light animate-fade-in">
                    Report emergencies instantly, view live danger zones on a real-time map,
                    and empower first responders to act faster when every second counts.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mb-20 animate-fade-in-up stagger">
                    <button onClick={() => navigate("/report")}
                        className="btn-premium bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-red-900/40 flex items-center gap-2.5 border border-red-500/30">
                        <span className="text-xl">🚨</span> Report Emergency
                    </button>
                    <button onClick={() => navigate("/livemap")}
                        className="btn-premium glass-panel hover:bg-white/5 px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2.5 border border-white/10">
                        <span className="text-xl">🗺️</span> Live Map
                    </button>
                    <button onClick={() => navigate("/sos")}
                        className="btn-premium bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-orange-900/40 flex items-center gap-2.5 border border-orange-500/30">
                        <span className="text-xl">🆘</span> Emergency SOS
                    </button>
                </div>

                {/* Feature grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl animate-fade-in-up">
                    {features.map((f, i) => (
                        <div key={f.title} className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-blue-500/25 transition-all duration-300 hover:scale-[1.02] text-left"
                            style={{ animationDelay: `${i * 80}ms` }}>
                            <span className="text-3xl mb-4 block">{f.icon}</span>
                            <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;