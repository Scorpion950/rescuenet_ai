import {
    useEffect,
    useState,
} from "react";

import {
    collection,
    onSnapshot,
} from "firebase/firestore";

import { db } from "../../firebase";

function AdminOverview() {

    const [reports, setReports] =
        useState([]);

    const [sosAlerts, setSosAlerts] =
        useState([]);

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Fetch Reports
    useEffect(() => {

        const unsubscribe =
            onSnapshot(

                collection(
                    db,
                    "reports"
                ),

                (snapshot) => {

                    const fetchedReports = [];
                    
                    if (!isInitialLoad) {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                toast.error(`New Emergency Report: ${change.doc.data().type || 'Incident'}!`, {
                                    duration: 6000,
                                    position: 'top-right',
                                });
                            }
                        });
                    }

                    snapshot.forEach((doc) => {

                        fetchedReports.push({

                            id: doc.id,

                            ...doc.data(),

                        });

                    });

                    setReports(
                        fetchedReports
                    );

                    setIsInitialLoad(false);

                }

            );

        return () => unsubscribe();

    }, [isInitialLoad]);

    const [isSosInitial, setIsSosInitial] = useState(true);

    // Fetch SOS Alerts
    useEffect(() => {

        const unsubscribe =
            onSnapshot(

                collection(
                    db,
                    "sosAlerts"
                ),

                (snapshot) => {

                    const fetchedAlerts = [];
                    
                    if (!isSosInitial) {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                toast.error("🚨 NEW SOS ALERT TRIGGERED!", {
                                    duration: 8000,
                                    position: 'top-right',
                                });
                            }
                        });
                    }

                    snapshot.forEach((doc) => {

                        fetchedAlerts.push({

                            id: doc.id,

                            ...doc.data(),

                        });

                    });

                    setSosAlerts(
                        fetchedAlerts
                    );
                    
                    setIsSosInitial(false);

                }

            );

        return () => unsubscribe();

    }, [isSosInitial]);

    // Statistics
    const severeReports =

        reports.filter(

            report =>

                report.severity ===
                "HIGH"

                ||

                report.severity ===
                "CRITICAL"

        );


    const verifiedReports =

        reports.filter(

            report =>

                report.status ===
                "VERIFIED & LIVE"

        );
    return (

        <div className="min-h-screen bg-mesh p-8 text-white relative">
            
            <div className="absolute inset-0 bg-black/40 z-0"></div>

            <div className="relative z-10">
                {/* Page Title */}
                <h1 className="text-6xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 drop-shadow-lg">

                    RescueNet Overview

                </h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

                {/* Total Reports */}
                <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-blue-500/50 transition-colors duration-300">

                    <h2 className="text-xl font-semibold text-gray-400 mb-3">

                        Total Reports

                    </h2>

                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-md">

                        {reports.length}

                    </p>

                </div>

                {/* Active SOS */}
                <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-red-500/30 hover:border-red-500/60 transition-colors duration-300">

                    <h2 className="text-xl font-semibold text-gray-400 mb-3">

                        Active SOS Alerts

                    </h2>

                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 drop-shadow-md">

                        {sosAlerts.length}

                    </p>

                </div>

                {/* Severe Incidents */}
                <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-yellow-500/50 transition-colors duration-300">

                    <h2 className="text-xl font-semibold text-gray-400 mb-3">

                        Severe Incidents

                    </h2>

                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 drop-shadow-md">

                        {severeReports.length}

                    </p>

                </div>

                {/* Verified Reports */}
                <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 hover:border-green-500/50 transition-colors duration-300">

                    <h2 className="text-xl font-semibold text-gray-400 mb-3">

                        Verified Reports

                    </h2>

                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 drop-shadow-md">

                        {verifiedReports.length}

                    </p>

                </div>

            </div>

            {/* System Status */}
            <div className="mt-12 glass-panel p-10 rounded-3xl shadow-2xl border border-white/10">

                <h2 className="text-3xl font-extrabold mb-8 text-gray-200">

                    System Status

                </h2>

                <div className="space-y-6 text-xl">

                    <div className="flex justify-between">

                        <span>

                            Firebase Connection

                        </span>

                        <span className="text-green-400 font-bold">

                            ACTIVE

                        </span>

                    </div>

                    <div className="flex justify-between">

                        <span>

                            Incident Monitoring

                        </span>

                        <span className="text-green-400 font-bold">

                            RUNNING

                        </span>

                    </div>

                    <div className="flex justify-between">

                        <span>

                            SOS Dispatch System

                        </span>

                        <span className="text-green-400 font-bold">

                            ACTIVE

                        </span>

                    </div>

                    <div className="flex justify-between">

                        <span>

                            AI Classification

                        </span>

                        <span className="text-green-400 font-bold">

                            ONLINE

                        </span>

                    </div>

                </div>

            </div>
            </div>

        </div>

    );

}

export default AdminOverview;