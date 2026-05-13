import {
    Outlet,
    NavLink,
} from "react-router-dom";

function AdminLayout() {

    return (

        <div className="min-h-screen bg-slate-950 text-white">

            {/* Admin Navbar */}
            <div className="bg-red-700 px-6 py-4 flex justify-between items-center shadow-lg">

                <h1 className="text-2xl font-bold">

                    RescueNet Admin

                </h1>

                <div className="flex gap-6 text-lg">

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