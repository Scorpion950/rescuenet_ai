import {
    Navigate,
} from "react-router-dom";

function ResponderProtectedRoute({

    children,
    responderType,

}) {

    const storedType =
        localStorage.getItem(
            "responderType"
        );

    if (

        storedType !== responderType

    ) {

        return (
            <Navigate
                to="/responder"
            />
        );

    }

    return children;

}

export default ResponderProtectedRoute;