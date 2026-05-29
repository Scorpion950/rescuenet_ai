import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function Navbar() {

    const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();

    return (

        <nav className="bg-slate-950/90 backdrop-blur-md text-white px-6 py-4 shadow-lg border-b border-white/5 sticky top-0 z-50">

            <div className="flex flex-wrap justify-between items-center gap-4">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500"
                >
                    <img src="/logo.png" alt="RescueNet AI Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
                    RescueNet AI
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-4 flex-wrap">

                    <Link to="/" className="hover:text-red-400 transition font-medium">
                        Home
                    </Link>

                    <Link to="/report" className="hover:text-red-400 transition font-medium">
                        Report
                    </Link>

                    <Link to="/livemap" className="hover:text-red-400 transition font-medium">
                        Live Map
                    </Link>

                    <Link to="/sos" className="hover:text-red-400 transition font-medium">
                        SOS
                    </Link>

                    {/* Auth0 Login / User Profile */}
                    {isLoading ? (
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            {/* User avatar */}
                            {user?.picture && (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    title={user.name}
                                    className="w-9 h-9 rounded-full ring-2 ring-blue-500/60 hover:ring-blue-400 transition cursor-pointer"
                                />
                            )}
                            {/* Logout */}
                            <button
                                onClick={() =>
                                    logout({ logoutParams: { returnTo: window.location.origin } })
                                }
                                className="bg-slate-800 hover:bg-slate-700 border border-white/10 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => loginWithRedirect()}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/40 transition-all"
                        >
                            Login
                        </button>
                    )}

                </div>

            </div>

        </nav>

    );

}

export default Navbar;