import {
    useEffect,
    useState,
} from "react";

import MapPopup from
    "../components/MapPopup";

import {
    sendVerificationVote,
} from "../services/verificationService";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    Circle,
} from "react-leaflet";
import L from "leaflet";

import {
    collection,
    onSnapshot,
} from "firebase/firestore";

const userLocationIcon = new L.DivIcon({
    className: 'user-location-marker',
    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); animation: pulse 2s infinite;"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { duration: 2 });
        }
    }, [center, map]);
    return null;
}

function LocateControl({ location }) {
    const map = useMap();
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (location) map.flyTo(location, 16, { animate: true, duration: 1.5 });
            }}
            style={{
                position: "absolute",
                bottom: "88px",
                right: "10px",
                zIndex: 1000,
                width: "40px",
                height: "40px",
                background: "white",
                border: "2px solid rgba(0,0,0,0.12)",
                borderRadius: "4px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
            }}
            title="Your Location"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
        </button>
    );
}

import MarkerClusterGroup from 'react-leaflet-cluster';

import toast from "react-hot-toast";

import { db } from "../firebase";

import {

    API_BASE_URL,

} from "../utils/constants";

import { useLocation } from "../context/LocationContext";

function LiveMap({ isAdmin = false }) {
    const { userLocation } = useLocation();

    const [reports, setReports] =
        useState([]);
        
    const [showDangerZones, setShowDangerZones] = 
        useState(false);

    // Helper to determine danger zone size and color based on severity
    const getZoneOptions = (severity) => {
        switch (severity) {
            case "CRITICAL":
                return { radius: 1000, color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.4 }; // Red, 1KM
            case "HIGH":
                return { radius: 500, color: "#f97316", fillColor: "#f97316", fillOpacity: 0.3 }; // Orange, 500m
            case "MEDIUM":
            case "LOW":
                return { radius: 250, color: "#eab308", fillColor: "#eab308", fillOpacity: 0.2 }; // Yellow, 250m
            default:
                return { radius: 200, color: "#64748b", fillColor: "#64748b", fillOpacity: 0.2 }; // Gray
        }
    };

    // Verify Incident
    const verifyIncident = async (

        reportId,
        voteType

    ) => {

        try {

            // Previous vote
            const previousVote =

                localStorage.getItem(

                    `vote_${reportId}`

                );

            const response =

                await fetch(

                    `${API_BASE_URL}/verify-incident`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                        },

                        body: JSON.stringify({

                            reportId,
                            voteType,
                            previousVote,

                        }),

                    }

                );

            const data =
                await response.json();

            // Save latest vote
            localStorage.setItem(

                `vote_${reportId}`,

                voteType

            );

            toast.success(
                "Vote Updated"
            );



        }

        catch (error) {

            console.error(error);

            toast.error(
                "Vote failed"
            );

        }

    };

    // Fetch reports realtime
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
                    
                    // Sort by newest first
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

        <div className="p-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-5xl font-bold">
                    Live Disaster Map
                </h1>
                
                {/* Danger Zone Toggle */}
                <button
                    onClick={() => setShowDangerZones(!showDangerZones)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all border ${
                        showDangerZones 
                            ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-900/30" 
                            : "bg-slate-800 text-gray-400 border-white/5 hover:bg-slate-700"
                    }`}
                >
                    <div className={`w-3 h-3 rounded-full ${showDangerZones ? "bg-red-500 animate-pulse" : "bg-gray-500"}`}></div>
                    {showDangerZones ? "Danger Zones ON" : "Show Danger Zones"}
                </button>
            </div>

            {/* Empty State */}
            {reports.length === 0 && (

                <div className="bg-slate-800 p-5 rounded-2xl text-center mb-6 text-gray-300">

                    No active incidents found right now.

                </div>

            )}

            {/* MAP ALWAYS SHOWS */}
            <div className="h-[75vh] rounded-2xl overflow-hidden shadow-lg">

                <MapContainer

                    center={[
                        20.5937,
                        78.9629
                    ]}

                    zoom={5}

                    minZoom={3}

                    maxZoom={18}

                    maxBounds={[
                        [-90, -180],
                        [90, 180]
                    ]}

                    maxBoundsViscosity={1.0}

                    className="h-full w-full"
                >

                    {/* FLOATING MAP LEGEND */}
                    {showDangerZones && (
                        <div className="absolute bottom-6 left-6 z-[1000] glass-panel p-4 rounded-xl border border-white/10 shadow-2xl animate-fade-in-up pointer-events-none">
                            <h3 className="font-bold text-lg mb-2 text-white drop-shadow-md">Hazard Zones</h3>
                            <div className="space-y-2 text-sm font-semibold">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-500 opacity-60"></div>
                                    <span className="text-red-200">1 KM (Critical)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-orange-500 opacity-50"></div>
                                    <span className="text-orange-200">500m (High)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-40"></div>
                                    <span className="text-yellow-200">250m (Medium)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <TileLayer

                        attribution='&copy; OpenStreetMap contributors'

                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                        noWrap={true}

                    />
                    
                    {userLocation && (
                        <>
                            <MapUpdater center={userLocation} />
                            <LocateControl location={userLocation} />
                        </>
                    )}

                    {userLocation && (
                        <Marker 
                            position={userLocation} 
                            icon={userLocationIcon}
                            zIndexOffset={1000}
                        >
                            <Popup>You are here</Popup>
                        </Marker>
                    )}

                    {/* DANGER ZONES OVERLAY */}
                    {showDangerZones && reports
                        .filter(report => report.status !== "RESOLVED")
                        .map(report => (
                            <Circle
                                key={`zone-${report.id}`}
                                center={[report.latitude || 18.5204, report.longitude || 73.8567]}
                                pathOptions={getZoneOptions(report.severity)}
                                radius={getZoneOptions(report.severity).radius}
                            >
                                <Popup>
                                    <div className="font-bold text-center text-slate-800">
                                        <div className="text-red-600 uppercase">Avoid Area</div>
                                        <div className="text-xs text-gray-600 mt-1">{report.type} Hazard</div>
                                        <div className="text-xs font-normal mt-1">Radius: {getZoneOptions(report.severity).radius}m</div>
                                    </div>
                                </Popup>
                            </Circle>
                        ))
                    }

                    <MarkerClusterGroup
                        chunkedLoading
                        maxClusterRadius={50}
                    >
                        {/* INCIDENT MARKERS */}
                        {reports
                            .filter((report) => {
                                // RESOLVED incidents are NEVER shown on the map (for anyone)
                                if (report.status === "RESOLVED") return false;
                                
                                // Admin sees all non-resolved incidents regardless of distance
                                if (isAdmin) return true;
                                
                                // If we have user location, filter by 3 KM radius (3000 meters)
                                if (userLocation && report.latitude && report.longitude) {
                                    const distance = L.latLng(userLocation[0], userLocation[1])
                                                     .distanceTo(L.latLng(report.latitude, report.longitude));
                                    return distance <= 3000;
                                }
                                
                                // If GPS is not available yet, default to showing the incident
                                return true;
                            })
                            .map((report) => (

                            <Marker

                                key={report.id}

                                position={[

                                    report.latitude || 18.5204,

                                    report.longitude || 73.8567,

                                ]}

                            >

                                <Popup>

                                    <MapPopup

                                        report={report}

                                        verifyIncident={
                                            verifyIncident
                                        }

                                    />

                                </Popup>

                            </Marker>

                        ))}
                    </MarkerClusterGroup>

                </MapContainer>

            </div>

        </div>

    );

}

export default LiveMap;