import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

function SOS() {

    const sendSOS = async (service) => {

        try {

            await addDoc(collection(db, "sosAlerts"), {

                service,
                createdAt: new Date(),

            });

            alert(`${service} Alert Sent Successfully!`);

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