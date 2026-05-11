import { useEffect, useState } from "react";

import {
    collection,
    getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

function Admin() {

    const [reports, setReports] = useState([]);

    useEffect(() => {

        const fetchReports = async () => {

            try {

                const querySnapshot = await getDocs(
                    collection(db, "reports")
                );

                const fetchedReports = [];

                querySnapshot.forEach((doc) => {

                    fetchedReports.push({
                        id: doc.id,
                        ...doc.data(),
                    });

                });

                setReports(fetchedReports);

            } catch (error) {

                console.error(error);

            }

        };

        fetchReports();

    }, []);

    return (
        <div className="p-6">

            <h1 className="text-4xl font-bold mb-6">
                Admin Dashboard
            </h1>

            <div className="grid gap-6">

                {reports.map((report) => (

                    <div
                        key={report.id}
                        className="bg-slate-800 p-6 rounded-2xl shadow-lg"
                    >

                        <h2 className="text-2xl font-bold text-red-400 mb-2">
                            {report.type}
                        </h2>

                        <p>
                            <span className="font-bold">
                                Location:
                            </span>
                            {" "}
                            {report.location}
                        </p>

                        <p>
                            <span className="font-bold">
                                Severity:
                            </span>
                            {" "}
                            {report.severity}
                        </p>

                        <p className="mt-2 text-gray-300">
                            {report.description}
                        </p>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Admin;