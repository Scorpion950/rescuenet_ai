function AlertCard({

    type,
    severity,
    location,
    status,

}) {

    return (

        <div className="bg-red-900 p-4 rounded-2xl shadow-lg mb-4">

            <h2 className="text-2xl font-bold mb-2">
                {type}
            </h2>

            <p>
                <span className="font-bold">
                    Severity:
                </span>{" "}
                {severity}
            </p>

            <p>
                <span className="font-bold">
                    Location:
                </span>{" "}
                {location}
            </p>

            <p>
                <span className="font-bold">
                    Status:
                </span>{" "}
                {status}
            </p>

        </div>

    );

}

export default AlertCard;