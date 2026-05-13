import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

function ResponderLogin() {

    const navigate =
        useNavigate();

    const [department, setDepartment] =
        useState("");

    const [password, setPassword] =
        useState("");

    const handleLogin = () => {

        // Police
        if (

            department === "Police" &&

            password === "police123"

        ) {

            localStorage.setItem(

                "responderType",

                "Police"

            );

            navigate(
                "/responder/police"
            );

            return;

        }

        // Ambulance
        if (

            department === "Ambulance" &&

            password === "ambulance123"

        ) {

            localStorage.setItem(

                "responderType",

                "Ambulance"

            );

            navigate(
                "/responder/ambulance"
            );

            return;

        }

        // Fire
        if (

            department === "Fire Brigade" &&

            password === "fire123"

        ) {

            localStorage.setItem(

                "responderType",

                "Fire Brigade"

            );

            navigate(
                "/responder/fire"
            );

            return;

        }

        alert(
            "Invalid credentials"
        );

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