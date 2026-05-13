import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import toast
    from "react-hot-toast";

import {
    API_BASE_URL,
} from "../utils/constants";

function AdminLogin() {

    const navigate =
        useNavigate();

    const [adminKey, setAdminKey] =
        useState("");

    // Login
    const handleLogin = async (e) => {
        if (e) e.preventDefault();

        try {

            const response =

                await fetch(

                    `${API_BASE_URL}/admin-login`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                        },

                        body: JSON.stringify({

                            password:
                                adminKey,

                        }),

                    }

                );

            const data =
                await response.json();

            // Invalid
            if (data.error) {

                toast.error(
                    data.error
                );

                return;

            }

            // Save admin session
            localStorage.setItem(

                "isAdmin",

                "true"

            );

            toast.success(
                "Admin Login Successful"
            );

            navigate("/admin");

        }

        catch (error) {

            console.error(error);

            toast.error(
                "Login failed"
            );

        }

    };

    return (

        <div className="min-h-screen flex justify-center items-center bg-mesh text-white px-4">

            <div className="glass-panel p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10">

                <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">

                    Admin Access

                </h1>

                <form onSubmit={handleLogin} className="space-y-6">
                    <input

                        type="password"

                        placeholder="Enter Admin Key"

                        value={adminKey}

                        onChange={(e) =>

                            setAdminKey(
                                e.target.value
                            )

                        }

                        className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:ring-2 focus:ring-red-500 outline-none transition-all"

                    />

                    <button
                        type="submit"
                        className="btn-premium w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 p-4 rounded-xl font-bold text-lg shadow-lg shadow-red-900/50"

                    >

                        Access Dashboard

                    </button>
                </form>

            </div>

        </div>

    );

}

export default AdminLogin;