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

import MarkerClusterGroup from 'react-leaflet-cluster';

import toast from "react-hot-toast";

import { db } from "../firebase";

import {

    API_BASE_URL,

} from "../utils/constants";

function LiveMap({ isAdmin = false }) {

    const [reports, setReports] =
        useState([]);
        
    const [userLocation, setUserLocation] = 
        useState(null);

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

    // Get User Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([
                        position.coords.latitude,
                        position.coords.longitude
                    ]);
                },
                (error) => {
                    if (error.code !== error.PERMISSION_DENIED) {
                        console.warn("Geolocation error:", error);
                    }
                }
            );
        }
    }, []);

    return (

        <div className="p-6">

            <h1 className="text-5xl font-bold mb-8">

                Live Disaster Map

            </h1>

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

                    <TileLayer

                        attribution='&copy; OpenStreetMap contributors'

                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                        noWrap={true}

                    />
                    
                    {userLocation && (
                        <MapUpdater center={userLocation} />
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

                    <MarkerClusterGroup
                        chunkedLoading
                        maxClusterRadius={50}
                    >
                        {/* INCIDENT MARKERS */}
                        {reports
                            .filter((report) => isAdmin || report.status !== "RESOLVED")
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