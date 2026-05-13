import {
    Outlet,
    useNavigate,
} from "react-router-dom";

function ResponderLayout() {

    const navigate =
        useNavigate();

    return (

        <div className="min-h-screen bg-mesh text-white">

            {/* Top Bar */}
            <div className="flex justify-end p-5">

                <button

                    onClick={() => {

                        localStorage.removeItem(

                            "responderType"

                        );

                        navigate(
                            "/responder"
                        );

                    }}

                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl font-bold"

                >

                    Logout

                </button>

            </div>

            <Outlet />

        </div>

    );

}

export default ResponderLayout;