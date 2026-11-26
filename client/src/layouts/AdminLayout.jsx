import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ClipboardList, LayoutDashboard, LogOut, MapPinned, ShieldCheck, Siren } from "lucide-react";
import { auth } from "../firebase";

const LINKS = [
  { to: "/admin", label: "Overview", Icon: LayoutDashboard, end: true },
  { to: "/admin/map", label: "Live map", Icon: MapPinned },
  { to: "/admin/sos", label: "SOS requests", Icon: Siren },
  { to: "/admin/reports", label: "Incident reports", Icon: ClipboardList },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  async function logout() {
    await signOut(auth);
    navigate("/admin-access", { replace: true });
  }
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-heading"><ShieldCheck size={22} />
            <span>RescueNet <strong>Operations</strong></span>
            <span className="portal-badge">ADMIN / DEMO</span>
          </div>
          <nav aria-label="Admin navigation" className="portal-nav">
            {LINKS.map(({ to, label, Icon, end }) =>
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => "portal-nav-link " + (isActive ? "active" : "")}>
                <Icon size={16} />{label}
              </NavLink>
            )}
          </nav>
          <button className="portal-logout" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </header>
      <div className="portal-demo-notice">Demonstration environment · External emergency services are not automatically contacted.</div>
      <Outlet />
    </div>
  );
}
