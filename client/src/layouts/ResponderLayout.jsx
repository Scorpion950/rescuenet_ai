import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ArrowLeft, LogOut, RadioTower } from "lucide-react";
import { auth } from "../firebase";

export default function ResponderLayout() {
  const navigate = useNavigate();
  async function logout() {
    await signOut(auth);
    navigate("/responder", { replace: true });
  }
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-heading"><RadioTower size={23} /><span>RescueNet <strong>Response</strong></span>
            <span className="portal-badge">TEAM / DEMO</span></div>
          <a href="/livemap" className="portal-nav-link"><ArrowLeft size={16} /> Public map</a>
          <button className="portal-logout" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </header>
      <div className="portal-demo-notice">Queue actions are recorded in RescueNet. This does not mean a real emergency unit has been dispatched.</div>
      <Outlet />
    </div>
  );
}
