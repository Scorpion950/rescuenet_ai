import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ShieldAlert, LoaderCircle } from "lucide-react";
import { useCivilianSession } from "../../context/CivilianSessionContext";
import { rememberDestination } from "../../utils/authNavigation";

function UserProtectedRoute({ children }) {
  const { isLoading, isAuthenticated, loginWithRedirect, error: authError } = useAuth0();
  const session = useCivilianSession();
  const redirecting = useRef(false);
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authError && !redirecting.current) {
      redirecting.current = true;
      const returnTo = rememberDestination(window.location.pathname + window.location.search);
      loginWithRedirect({ appState: { returnTo } }).catch((error) => {
        redirecting.current = false;
        console.error("Could not start Auth0 login:", error);
      });
    }
  }, [isLoading, isAuthenticated, authError, loginWithRedirect]);

  if (!isAuthenticated && !isLoading && authError) {
    return (
      <div className="session-state" role="alert">
        <ShieldAlert size={32} />
        <h2>Sign-in did not finish</h2>
        <p>{authError.message || "Your identity provider could not complete sign-in."}</p>
        <button className="button button-primary" onClick={() => {
          const returnTo = rememberDestination(window.location.pathname);
          loginWithRedirect({ appState: { returnTo } });
        }}>Try signing in again</button>
      </div>
    );
  }

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
