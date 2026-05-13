import {
    Outlet,
    NavLink,
    useNavigate,
} from "react-router-dom";

function AdminLayout() {

    const navigate =
        useNavigate();

    // Logout
    const logout = () => {

        localStorage.removeItem(
            "isAdmin"
        );

        navigate(
            "/admin-access"
        );

    };

    return (

        <div className="min-h-screen bg-mesh text-white">

            {/* Admin Navbar */}
            <div className="bg-red-700 px-6 py-4 flex justify-between items-center shadow-lg">

                <h1 className="text-2xl font-bold">

                    RescueNet Admin

                </h1>

                <div className="flex items-center gap-6 text-lg">

                    <NavLink

                        to="/admin"

                        className={({ isActive }) =>

                            isActive
                                ? "font-bold text-white"
                                : "text-gray-200 hover:text-white"

                        }

                    >

                        Overview

                    </NavLink>

                    <NavLink

                        to="/admin/map"

                        className={({ isActive }) =>

                            isActive
                                ? "font-bold text-white"
                                : "text-gray-200 hover:text-white"

                        }

                    >

                        Live Map

                    </NavLink>

                    <NavLink

                        to="/admin/sos"

                        className={({ isActive }) =>

                            isActive
                                ? "font-bold text-white"
                                : "text-gray-200 hover:text-white"

                        }

                    >

                        SOS Alerts

                    </NavLink>

                    <NavLink

                        to="/admin/reports"

                        className={({ isActive }) =>

                            isActive
                                ? "font-bold text-white"
                                : "text-gray-200 hover:text-white"

                        }

                    >

                        Reports

                    </NavLink>

                    {/* Logout Button */}
                    <button

                        onClick={logout}

                        className="bg-red-900 hover:bg-red-950 px-5 py-2 rounded-xl font-bold transition"

                    >

                        Logout

                    </button>

                </div>

            </div>

            {/* Page Content */}
            <div className="p-6">

                <Outlet />

            </div>

        </div>

    );

}

export default AdminLayout;