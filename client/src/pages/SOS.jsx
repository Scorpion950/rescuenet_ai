import { useState } from "react";
import { sendSOSRequest } from "../services/sosService";
import toast from "react-hot-toast";

const SERVICES = [
    { id: "police-cb", value: "Police", icon: "🚓", label: "Police", desc: "Law enforcement & security", color: "border-blue-500/40 hover:border-blue-400 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-500/15" },
    { id: "ambulance-cb", value: "Ambulance", icon: "🚑", label: "Ambulance", desc: "Medical emergency response", color: "border-rose-500/40 hover:border-rose-400 has-[:checked]:border-rose-400 has-[:checked]:bg-rose-500/15" },
    { id: "fire-cb", value: "Fire Brigade", icon: "🚒", label: "Fire Brigade", desc: "Fire suppression & rescue", color: "border-orange-500/40 hover:border-orange-400 has-[:checked]:border-orange-400 has-[:checked]:bg-orange-500/15" },
];

function SOS() {
    const [loading, setLoading] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const [result, setResult] = useState(null);

    const handleServiceChange = (e) => {
        const service = e.target.value;
        setSelectedServices(prev =>
            e.target.checked ? [...prev, service] : prev.filter(s => s !== service)
        );
    };

    const sendSOS = async () => {
        if (selectedServices.length === 0) {
            toast.error("Please select at least one emergency service.");
            return;
        }

        setLoading(true);
        setResult(null);

        const getLocation = () => new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject({ code: 0, message: "Geolocation not supported" });
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, timeout: 20000, maximumAge: 0,
            });
        });

        try {
            const position = await getLocation();
            const { latitude, longitude } = position.coords;

            const geoResp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const geoData = await geoResp.json();
            const addr = geoData.address || {};
            const location = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || addr.county || addr.state || "Unknown Area";

            const data = await sendSOSRequest(selectedServices, latitude, longitude, location);

            if (data.error) {
                toast.error(data.error);
                return;
            }

            setResult({ success: true, message: data.message, stations: data.assignedStations || [] });
            setSelectedServices([]);
            toast.success("SOS dispatched successfully!");

        } catch (error) {
            console.error("SOS ERROR:", error);
            const msgs = {
                1: "Location permission denied. Enable location for this site and retry.",
                2: "Location unavailable. Move to open area and retry.",
                3: "Location timed out. Ensure GPS is enabled and retry.",
            };
            toast.error(msgs[error?.code] || "Location access failed. Enable location services and retry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-12">

            <div className="w-full max-w-lg animate-fade-in-up">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/40 mb-5 emergency-glow">
                        <span className="text-4xl">🆘</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-2">Emergency SOS</h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Select the services you need. Your GPS location will be shared immediately with the nearest stations.
                    </p>
                </div>

                {/* Service selection */}
                <div className="glass-panel rounded-2xl border border-white/10 p-6 mb-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Select Emergency Services</p>
                    <div className="space-y-3">
                        {SERVICES.map((svc) => (
                            <label key={svc.id} htmlFor={svc.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${svc.color}`}>
                                <input
                                    id={svc.id}
                                    name={svc.value}
                                    type="checkbox"
                                    value={svc.value}
                                    checked={selectedServices.includes(svc.value)}
                                    onChange={handleServiceChange}
                                    className="w-5 h-5 accent-red-500 cursor-pointer"
                                />
                                <span className="text-2xl">{svc.icon}</span>
                                <div>
                                    <p className="font-bold text-white">{svc.label}</p>
                                    <p className="text-xs text-slate-500">{svc.desc}</p>
                                </div>
                                {selectedServices.includes(svc.value) && (
                                    <span className="ml-auto text-green-400 text-lg">✓</span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Selected summary */}
                {selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5 px-1">
                        {selectedServices.map(s => (
                            <span key={s} className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                {/* SOS Button */}
                <button
                    id="send-sos-btn"
                    onClick={sendSOS}
                    disabled={loading || selectedServices.length === 0}
                    className={`w-full py-5 rounded-2xl text-xl font-extrabold tracking-wide uppercase transition-all shadow-2xl ${
                        loading || selectedServices.length === 0
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/50 hover:scale-[1.02] active:scale-95 emergency-glow"
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-3">
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Dispatching…
                        </span>
                    ) : "🆘 Send Emergency SOS"}
                </button>

                <p className="text-center text-xs text-slate-600 mt-4">
                    Your location is only shared during an emergency dispatch.
                </p>

                {/* Result panel */}
                {result?.success && (
                    <div className="mt-6 glass-panel rounded-2xl border border-emerald-500/30 p-6 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-bold text-emerald-400">SOS Dispatched</p>
                                <p className="text-sm text-slate-400">{result.message}</p>
                            </div>
                        </div>
                        {result.stations?.length > 0 && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Responding Stations</p>
                                <div className="space-y-2">
                                    {result.stations.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-2.5 border border-white/5">
                                            <div>
                                                <p className="text-sm font-semibold text-blue-300">{s.name}</p>
                                                <p className="text-xs text-slate-500">{s.type}</p>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">{s.distance} km</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SOS;