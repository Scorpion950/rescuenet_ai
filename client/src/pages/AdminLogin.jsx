import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

function AdminLogin() {

    const navigate =
        useNavigate();

    const [adminKey, setAdminKey] =
        useState("");

    const handleLogin = () => {

        // Temporary frontend check
        if (
            adminKey ===
            "RESCUENET_ADMIN"
        ) {

            localStorage.setItem(
                "isAdmin",
                "true"
            );

            navigate("/admin");

        } else {

            alert(
                "Invalid Admin Key"
            );

        }

    };

    return (

        <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white px-4">

            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-md">

                <h1 className="text-3xl font-bold text-center mb-6 text-red-500">

                    Admin Access

                </h1>

                <input

                    type="password"

                    placeholder="Enter Admin Key"

                    value={adminKey}

                    onChange={(e) =>
                        setAdminKey(
                            e.target.value
                        )
                    }

                    className="w-full p-3 rounded-xl bg-slate-700 text-white mb-4"

                />

                <button

                    onClick={handleLogin}

                    className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-semibold"

                >

                    Access Dashboard

                </button>

            </div>

        </div>

    );

}

export default AdminLogin;