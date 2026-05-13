import Navbar from
    "../components/Navbar";

import {
    Outlet,
} from "react-router-dom";

function UserLayout() {

    return (

        <div className="min-h-screen bg-mesh text-white">

            <Navbar />

            <Outlet />

        </div>

    );

}

export default UserLayout;