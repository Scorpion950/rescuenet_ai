import { Outlet, Link } from "react-router-dom";
import { Activity } from "lucide-react";
import Navbar from "../components/Navbar";

export default function UserLayout() {
  return (
    <div className="site-shell">
      <Navbar />
      <Outlet />
      <footer className="site-footer">
        <div className="content-width footer-inner">
          <Link to="/" className="footer-brand"><Activity size={18} /> RescueNet AI</Link>
          <span>Community awareness • Demonstration platform</span>
          <div>
            <Link to="/livemap">Live map</Link>
            <Link to="/responder">Responder portal</Link>
            <Link to="/admin-access">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
