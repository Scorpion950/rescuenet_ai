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
    const handleLogin = async () => {

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

        <div className="min-h-screen flex justify-center items-center bg-slate-950 text-white">

            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-md">

                <h1 className="text-4xl font-bold mb-8 text-center">

                    Responder Portal

                </h1>

                {/* Department */}
                <select

                    value={department}

                    onChange={(e) =>

                        setDepartment(
                            e.target.value
                        )

                    }

                    className="w-full p-3 rounded-xl bg-slate-700 mb-4"

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

                    className="w-full p-3 rounded-xl bg-slate-700 mb-6"

                />

                {/* Login */}
                <button

                    onClick={handleLogin}

                    className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-bold"

                >

                    Login

                </button>

            </div>

        </div>

    );

}

export default ResponderLogin;