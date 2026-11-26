import { Navigate } from "react-router-dom";
import useFirebaseRole from "../../hooks/useFirebaseRole";

export default function ResponderProtectedRoute({ children, responderType }) {
  const { loading, role, department } = useFirebaseRole();
  if (loading) return <div className="session-state">Checking responder permissions…</div>;
  return role === "responder" && department === responderType
    ? children : <Navigate to="/responder" replace />;
}
