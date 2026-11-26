/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebase";
import { API_BASE_URL } from "../utils/constants";

const CivilianSessionContext = createContext(null);

export function CivilianSessionProvider({ children }) {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const [session, setSession] = useState({ ready: false, loading: true, error: null });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user?.sub) {
      return;
    }
    let cancelled = false;
    async function connect() {
      setSession({ ready: false, loading: true, error: null });
      try {
        const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
        if (!audience) throw new Error("Auth0 API audience is missing in your site configuration.");
        const accessToken = await getAccessTokenSilently({
          authorizationParams: { audience },
        });
        const response = await fetch(API_BASE_URL + "/auth/firebase-token", {
          method: "POST",
          headers: { Authorization: "Bearer " + accessToken },
        });
        const result = await response.json();
        if (!response.ok || !result.firebaseToken) {
          throw new Error(result.error || "Could not verify your account.");
        }
        await signInWithCustomToken(auth, result.firebaseToken);
        const firebaseToken = await auth.currentUser.getIdToken();
        await fetch(API_BASE_URL + "/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + firebaseToken,
          },
          body: JSON.stringify({ name: user.name || "", email: user.email || "" }),
        });
        if (!cancelled) setSession({ ready: true, loading: false, error: null });
      } catch (error) {
        if (!cancelled) setSession({ ready: false, loading: false, error: error.message });
      }
    }
    connect();
    return () => { cancelled = true; };
  }, [isAuthenticated, isLoading, user?.sub, user?.name, user?.email, getAccessTokenSilently]);

  return (
    <CivilianSessionContext.Provider value={{
      ...(!isAuthenticated ? { ready: false, loading: isLoading, error: null } : session),
      isAuthenticated, isLoading, user,
    }}>
      {children}
    </CivilianSessionContext.Provider>
  );
}

export function useCivilianSession() {
  const context = useContext(CivilianSessionContext);
  if (!context) throw new Error("CivilianSessionProvider is required.");
  return context;
}
