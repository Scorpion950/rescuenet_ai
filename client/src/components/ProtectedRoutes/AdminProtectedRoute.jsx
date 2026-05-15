import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {

    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!isAdmin) {
        return <Navigate to="/admin-access" replace />;
    }

    return children;

}

export default AdminProtectedRoute;