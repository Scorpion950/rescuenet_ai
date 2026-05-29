import { useState } from "react";
import { API_BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";

function AlertCard({ alert }) {
    const [voting, setVoting] = useState(false);

    const severityGlow =
        alert.severity === "HIGH" || alert.severity === "CRITICAL" || alert.severity === "Severe" || alert.severity === "High"
            ? "emergency-glow border-red-500/50"
            : "border-orange-500/30";

    const verifyIncident = async (voteType) => {
        if (!alert.id) return;
        setVoting(true);
        try {
            const previousVote = localStorage.getItem(`vote_${alert.id}`);
            const response = await fetch(`${API_BASE_URL}/verify-incident`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId: alert.id, voteType, previousVote }),
            });
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem(`vote_${alert.id}`, voteType);
                toast.success("Vote Updated");
            } else {
                throw new Error(data.error || "Vote failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Vote failed");
        } finally {
            setVoting(false);
        }
    };

    return (
        <div className={`glass-panel p-6 rounded-2xl shadow-xl mb-4 border transition-all duration-300 hover:scale-[1.02] ${severityGlow}`}>
            
            <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-2xl font-bold tracking-wide text-white">
                    {alert.type}
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-slate-800/50 border-slate-500/30 text-slate-300">
                    {alert.distance ? `${alert.distance} km away` : "Nearby"}
                </span>
            </div>

            <p className="text-sm text-slate-300 mb-1">
                <span className="font-bold text-slate-400">Severity:</span>{" "}
                <span className={alert.severity === "CRITICAL" || alert.severity === "HIGH" ? "text-red-400 font-bold" : "text-orange-400 font-bold"}>
                    {alert.severity}
                </span>
            </p>

            <p className="text-sm text-slate-300 mb-1">
                <span className="font-bold text-slate-400">Location:</span>{" "}
                {alert.location}
            </p>

            <p className="text-sm text-slate-300 mb-3">
                <span className="font-bold text-slate-400">Status:</span>{" "}
                <span className={alert.status === "VERIFIED & LIVE" ? "text-emerald-400 font-bold" : "text-yellow-400"}>
                    {alert.status || "PENDING"}
                </span>
            </p>

            {alert.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {alert.description}
                </p>
            )}

            {/* Voting Buttons */}
            <div className="flex gap-2 flex-wrap mb-4">
                <button onClick={() => verifyIncident("yes")} disabled={voting}
                    className="flex-1 min-w-[80px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-sm font-bold transition disabled:opacity-50">
                    ✅ Yes ({alert.verifiedYes || 0})
                </button>
                <button onClick={() => verifyIncident("no")} disabled={voting}
                    className="flex-1 min-w-[80px] bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-sm font-bold transition disabled:opacity-50">
                    ❌ No ({alert.verifiedNo || 0})
                </button>
                <button onClick={() => verifyIncident("unsure")} disabled={voting}
                    className="flex-1 min-w-[80px] bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-xl text-sm font-bold transition disabled:opacity-50">
                    🤔 Unsure ({alert.verifiedUnsure || 0})
                </button>
            </div>

            {/* Media Gallery */}
            {((alert.mediaUrls && alert.mediaUrls.length > 0) || (alert.media && alert.media.length > 0)) && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {((alert.mediaUrls && alert.mediaUrls.length > 0) ? alert.mediaUrls : alert.media).slice(0, 2).map((mediaItem, index) => {
                        const url = typeof mediaItem === "string" ? mediaItem : mediaItem?.url;
                        const type = typeof mediaItem === "object" && mediaItem?.type ? mediaItem.type : url?.match(/\.(mp4|webm|mov)$/i) ? "video" : "image";
                        return type === "video" ? (
                            <video key={index} controls className="rounded-xl w-full h-24 object-cover bg-black/30 cursor-pointer" onClick={(e) => { e.preventDefault(); window.open(url, '_blank'); }}>
                                <source src={url} />
                            </video>
                        ) : (
                            <img key={index} src={url} alt="Incident" className="rounded-xl w-full h-24 object-cover bg-black/30 cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => { e.preventDefault(); window.open(url, '_blank'); }} />
                        );
                    })}
                    {((alert.mediaUrls || alert.media || []).length > 2) && (
                        <span className="text-xs text-slate-500 col-span-2">
                            +{((alert.mediaUrls || alert.media || []).length - 2)} more files
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default AlertCard;