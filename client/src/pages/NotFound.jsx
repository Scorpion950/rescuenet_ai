import {
    Link,
} from "react-router-dom";

function NotFound() {

    return (

        <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center">

            <h1 className="text-8xl font-bold text-red-600 mb-4">

                404

            </h1>

            <p className="text-2xl mb-6">

                Page Not Found

            </p>

            <Link

                to="/"

                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold"

            >

                Go Home

            </Link>

        </div>

    );

}

export default NotFound;