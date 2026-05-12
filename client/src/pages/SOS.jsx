function SOS() {

    const sendSOS = async (service) => {

        try {

            // Get user location
            navigator.geolocation.getCurrentPosition(

                async (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    // Send SOS to backend
                    const response = await fetch(
                        "http://localhost:5000/send-sos",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({

                                service,
                                latitude,
                                longitude,

                            }),

                        }
                    );

                    const data =
                        await response.json();

                    // Error from backend
                    if (!response.ok) {

                        alert(data.error);

                        return;

                    }

                    // Success
                    alert(data.message);

                }

            );

        } catch (error) {

            console.error(error);

            alert("Failed to send SOS");

        }

    };

    return (

        <div className="min-h-screen flex flex-col justify-center items-center gap-8">

            <h1 className="text-5xl font-bold text-red-500">
                Emergency SOS
            </h1>

            <div className="flex flex-wrap gap-6 justify-center">

                <button
                    onClick={() => sendSOS("Ambulance")}
                    className="bg-red-600 hover:bg-red-700 px-10 py-5 rounded-2xl text-2xl font-bold"
                >
                    🚑 Ambulance
                </button>

                <button
                    onClick={() => sendSOS("Fire Brigade")}
                    className="bg-orange-600 hover:bg-orange-700 px-10 py-5 rounded-2xl text-2xl font-bold"
                >
                    🚒 Fire Brigade
                </button>

                <button
                    onClick={() => sendSOS("Police")}
                    className="bg-blue-600 hover:bg-blue-700 px-10 py-5 rounded-2xl text-2xl font-bold"
                >
                    🚓 Police
                </button>

            </div>

        </div>

    );

}

export default SOS;