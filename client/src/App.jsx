import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Report from "./pages/Report";
import LiveMap from "./pages/LiveMap";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>

      <div className="min-h-screen bg-slate-900 text-white">

        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-4 bg-slate-800 shadow-lg">

          <h1 className="text-2xl font-bold text-red-500">
            RescueNet AI
          </h1>

          <div className="space-x-6">

            <Link to="/" className="hover:text-red-400">
              Home
            </Link>

            <Link to="/report" className="hover:text-red-400">
              Report
            </Link>

            <Link to="/map" className="hover:text-red-400">
              Live Map
            </Link>

            <Link to="/admin" className="hover:text-red-400">
              Admin
            </Link>

          </div>
        </nav>

        {/* Routes */}
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/report" element={<Report />} />

          <Route path="/map" element={<LiveMap />} />

          <Route path="/admin" element={<Admin />} />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;