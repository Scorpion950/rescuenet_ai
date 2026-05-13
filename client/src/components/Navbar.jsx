import {
    Link,
} from "react-router-dom";

function Navbar() {

    return (

        <nav className="bg-slate-950 text-white px-6 py-4 shadow-lg">

            <div className="flex flex-wrap justify-between items-center">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl font-bold text-red-500"
                >

                    RescueNet AI

                </Link>

                {/* Navigation Links */}
                <div className="flex gap-4 mt-4 md:mt-0">

                    <Link
                        to="/"
                        className="hover:text-red-400 transition"
                    >

                        Home

                    </Link>

                    <Link
                        to="/report"
                        className="hover:text-red-400 transition"
                    >

                        Report

                    </Link>

                    <Link
                        to="/livemap"
                        className="hover:text-red-400 transition"
                    >

                        Live Map

                    </Link>

                    <Link
                        to="/sos"
                        className="hover:text-red-400 transition"
                    >

                        SOS

                    </Link>

                </div>

            </div>

        </nav>

    );

}

export default Navbar;