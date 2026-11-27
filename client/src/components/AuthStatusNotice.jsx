import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ShieldAlert } from "lucide-react";
import { rememberDestination } from "../utils/authNavigation";

export default function AuthStatusNotice() {
  const { error, isAuthenticated, loginWithRedirect } = useAuth0();
  const [retryError, setRetryError] = useState("");
  if ((!error || isAuthenticated) && !retryError) return null;

  const detail = retryError || error?.message || "The identity provider did not complete sign-in.";
  return (
    <div className="auth-notice content-width" role="alert">
      <ShieldAlert size={24} aria-hidden="true" />
      <div>
        <strong>Sign-in could not be completed</strong>
        <p>{detail}</p>
        <p>Check your Auth0 application callback URL and allowed web origins if this keeps happening.</p>
      </div>
      <button className="button button-primary" onClick={async () => {
        setRetryError("");
        try {
          const returnTo = rememberDestination("/report");
          await loginWithRedirect({ appState: { returnTo } });
        } catch (loginError) {
          setRetryError(loginError.message || "Login could not start. Please retry.");
        }
      }}>Try again</button>
    </div>
  );
}
