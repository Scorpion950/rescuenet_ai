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

function ResponderLogin() {

    const navigate =
        useNavigate();

    const [department, setDepartment] =
        useState("");

    const [password, setPassword] =
        useState("");

    // Login
    const handleLogin = async (e) => {
        if (e) e.preventDefault();

        try {

            const response =

                await fetch(

                    `${API_BASE_URL}/responder-login`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                        },

                        body: JSON.stringify({

                            department,

                            password,

                        }),

                    }

                );

            const data =
                await response.json();

            // Error
            if (data.error) {

                toast.error(
                    data.error
                );

                return;

            }

            // Save responder type
            localStorage.setItem(

                "responderType",

                data.responderType

            );

            toast.success(
                "Login Successful"
            );

            // Redirect
            if (

                data.responderType ===
                "Police"

            ) {

                navigate(
                    "/responder/police"
                );

            }

            else if (

                data.responderType ===
                "Ambulance"

            ) {

                navigate(
                    "/responder/ambulance"
                );

            }

            else {

                navigate(
                    "/responder/fire"
                );

            }

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

                <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">

                    Responder Portal

                </h1>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Department */}
                    <select

                        value={department}

                        onChange={(e) =>

                            setDepartment(
                                e.target.value
                            )

                        }

                        className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"

                    >

                        <option value="">
                            Select Department
                        </option>

                        <option value="Police">
                            Police
                        </option>

                        <option value="Ambulance">
                            Ambulance
                        </option>

                        <option value="Fire Brigade">
                            Fire Brigade
                        </option>

                    </select>

                    {/* Password */}
                    <input

                        type="password"

                        placeholder="Enter Password"

                        value={password}

                        onChange={(e) =>

                            setPassword(
                                e.target.value
                            )

                        }

                        className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"

                    />

                    {/* Login */}
                    <button
                        type="submit"
                        className="btn-premium w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/50"

                    >

                        Login

                    </button>
                </form>

            </div>

        </div>

    );

}

export default ResponderLogin;