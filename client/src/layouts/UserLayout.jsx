import Navbar from
    "../components/Navbar";

import {
    Outlet,
} from "react-router-dom";

function UserLayout() {

    return (

        <div className="min-h-screen bg-slate-900 text-white">

            <Navbar />

            <Outlet />

        </div>

    );

}

export default UserLayout;