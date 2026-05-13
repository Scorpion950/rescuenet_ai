import {
    Navigate,
} from "react-router-dom";

function AdminProtectedRoute({

    children,

}) {

    const isAdmin =
        localStorage.getItem(
            "isAdmin"
        );

    if (!isAdmin) {

        return (
            <Navigate
                to="/admin-access"
            />
        );

    }

    return children;

}

export default AdminProtectedRoute;