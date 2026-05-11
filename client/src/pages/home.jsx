function Home() {
    return (
        <div className="flex flex-col justify-center items-center text-center h-[80vh] px-6">

            <h1 className="text-5xl font-bold mb-6">
                AI-Powered Disaster Response Platform
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mb-8">
                Report emergencies, view live danger zones, and help responders act faster during critical situations.
            </p>

            <div className="space-x-4">
                <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-lg font-semibold">
                    Report Emergency
                </button>

                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg font-semibold">
                    View Live Map
                </button>
            </div>

        </div>
    );
}

export default Home;