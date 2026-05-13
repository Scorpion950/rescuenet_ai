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

                    snapshot.forEach((doc) => {

                        fetchedReports.push({

                            id: doc.id,

                            ...doc.data(),

                        });

                    });

                    setReports(
                        fetchedReports
                    );

                }

            );

        return () => unsubscribe();

    }, []);

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

                    snapshot.forEach((doc) => {

                        fetchedAlerts.push({

                            id: doc.id,

                            ...doc.data(),

                        });

                    });

                    setSosAlerts(
                        fetchedAlerts
                    );

                }

            );

        return () => unsubscribe();

    }, []);

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

        <div>

            {/* Page Title */}
            <h1 className="text-5xl font-bold mb-10">

                RescueNet Overview

            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Total Reports */}
                <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">

                    <h2 className="text-xl font-semibold text-gray-300 mb-2">

                        Total Reports

                    </h2>

                    <p className="text-5xl font-bold text-blue-400">

                        {reports.length}

                    </p>

                </div>

                {/* Active SOS */}
                <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">

                    <h2 className="text-xl font-semibold text-gray-300 mb-2">

                        Active SOS Alerts

                    </h2>

                    <p className="text-5xl font-bold text-red-400">

                        {sosAlerts.length}

                    </p>

                </div>

                {/* Severe Incidents */}
                <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">

                    <h2 className="text-xl font-semibold text-gray-300 mb-2">

                        Severe Incidents

                    </h2>

                    <p className="text-5xl font-bold text-yellow-400">

                        {severeReports.length}

                    </p>

                </div>

                {/* Verified Reports */}
                <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">

                    <h2 className="text-xl font-semibold text-gray-300 mb-2">

                        Verified Reports

                    </h2>

                    <p className="text-5xl font-bold text-green-400">

                        {verifiedReports.length}

                    </p>

                </div>

            </div>

            {/* System Status */}
            <div className="mt-10 bg-slate-800 p-8 rounded-2xl shadow-lg">

                <h2 className="text-3xl font-bold mb-6">

                    System Status

                </h2>

                <div className="space-y-4 text-lg">

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

    );

}

export default AdminOverview;