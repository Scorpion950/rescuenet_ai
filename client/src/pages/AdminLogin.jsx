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
    const handleLogin = async () => {

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