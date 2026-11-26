import { Navigate } from "react-router-dom";
import useFirebaseRole from "../../hooks/useFirebaseRole";

export default function AdminProtectedRoute({ children }) {
  const { loading, role } = useFirebaseRole();
  if (loading) return <div className="session-state">Checking admin permissions…</div>;
  return role === "admin" ? children : <Navigate to="/admin-access" replace />;
}
