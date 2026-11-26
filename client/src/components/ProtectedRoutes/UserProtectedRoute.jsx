import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ShieldAlert, LoaderCircle } from "lucide-react";
import { useCivilianSession } from "../../context/CivilianSessionContext";

function UserProtectedRoute({ children }) {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const session = useCivilianSession();
  const redirecting = useRef(false);
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !redirecting.current) {
      redirecting.current = true;
      loginWithRedirect({ appState: { returnTo: window.location.pathname } });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading || session.loading || !isAuthenticated) {
    return (
      <div className="session-state">
        <LoaderCircle className="animate-spin" size={28} />
        <p>Verifying your account…</p>
      </div>
    );
  }
  if (session.error || !session.ready) {
    return (
      <div className="session-state">
        <ShieldAlert size={32} />
        <h2>We couldn't connect your account</h2>
        <p>{session.error || "Check your connection and try again."}</p>
        <button className="button button-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }
  return children;
}

export default UserProtectedRoute;
