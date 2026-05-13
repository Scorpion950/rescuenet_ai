function AlertCard({

    type,
    severity,
    location,
    status,

}) {

    const severityGlow =
        severity === "High" || severity === "Severe"
            ? "emergency-glow border-red-500/50"
            : "border-orange-500/30";

    return (

        <div className={`glass-panel p-6 rounded-2xl shadow-xl mb-4 border transition-all duration-300 hover:scale-[1.02] ${severityGlow}`}>

            <h2 className="text-2xl font-bold mb-3 tracking-wide">
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