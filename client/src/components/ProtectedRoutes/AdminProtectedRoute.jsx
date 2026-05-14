import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

function AdminProtectedRoute({
    children,
}) {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Check if Auth0 is configured before attempting redirect
            if (import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID) {
                loginWithRedirect();
            } else {
                console.warn("Auth0 is not configured. Add keys to .env");
            }
        }
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    // Fallback if env vars are missing to allow user to continue development temporarily
    if (!import.meta.env.VITE_AUTH0_DOMAIN || !import.meta.env.VITE_AUTH0_CLIENT_ID) {
        return children;
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-white text-xl">Loading Okta Security Policies...</div>;
    }

    if (!isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center text-white text-xl">Redirecting to Secure Login...</div>;
    }

    return children;
}

export default AdminProtectedRoute;