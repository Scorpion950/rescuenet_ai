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
                    className="flex items-center gap-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500"
                >
                    <img src="/logo.png" alt="RescueNet AI Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
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