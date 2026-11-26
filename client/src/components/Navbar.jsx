import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { signOut } from "firebase/auth";
import { Activity, ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { auth } from "../firebase";
import NotificationCenter from "./NotificationCenter";

const links = [
  { to: "/", label: "Overview", end: true },
  { to: "/livemap", label: "Live map" },
  { to: "/report", label: "Report incident" },
  { to: "/sos", label: "Emergency SOS", emergency: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
  const handleLogout = async () => {
    await signOut(auth);
    logout({ logoutParams: { returnTo: window.location.origin } });
  };
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="RescueNet AI home" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark"><Activity size={22} strokeWidth={2.4} /></span>
          <span>RescueNet<span className="brand-ai">AI</span></span>
        </Link>
        <div className="header-links">
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}
                className={({ isActive }) => [
                  "nav-link", isActive ? "is-active" : "", link.emergency ? "nav-emergency" : "",
                ].join(" ")}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <span className="header-divider" aria-hidden="true" />
          {!isLoading && isAuthenticated && <NotificationCenter />}
          {!isLoading && (isAuthenticated ? (
            <button className="header-account" title={"Signed in as " + (user?.name || "civilian")}
              onClick={handleLogout}>
              <LogOut size={17} /><span>Log out</span>
            </button>
          ) : (
            <button className="header-account sign-in" onClick={() => loginWithRedirect()}>
              Sign in <ArrowUpRight size={16} />
            </button>
          ))}
          <button className="mobile-menu-button" aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <NavLink key={link.to} end={link.end} to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => "mobile-nav-link " + (isActive ? "is-active" : "")}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
