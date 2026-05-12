function MapPopup({

    report,
    verifyIncident,

}) {

    return (

        <div className="w-64">

            <h2 className="font-bold text-lg mb-2">
                {report.type}
            </h2>

            <p>
                <span className="font-bold">
                    Location:
                </span>{" "}
                {report.location}
            </p>

            <p>
                <span className="font-bold">
                    Severity:
                </span>{" "}
                {report.severity}
            </p>

            <p className="mt-2">
                {report.description}
            </p>

            {/* Voting Buttons */}
            <div className="mt-4 flex gap-2 flex-wrap">

                <button
                    onClick={() =>
                        verifyIncident(
                            report.id,
                            "yes"
                        )
                    }
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg font-bold"
                >
                    ✅ Yes
                </button>

                <button
                    onClick={() =>
                        verifyIncident(
                            report.id,
                            "no"
                        )
                    }
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg font-bold"
                >
                    ❌ No
                </button>

                <button
                    onClick={() =>
                        verifyIncident(
                            report.id,
                            "unsure"
                        )
                    }
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg font-bold"
                >
                    🤔 Unsure
                </button>

            </div>

            {/* Vote Counts */}
            <div className="mt-4 text-sm">

                <p>
                    ✅ Yes:
                    {" "}
                    {report.verifiedYes || 0}
                </p>

                <p>
                    ❌ No:
                    {" "}
                    {report.verifiedNo || 0}
                </p>

                <p>
                    🤔 Unsure:
                    {" "}
                    {report.verifiedUnsure || 0}
                </p>

                <p className="mt-2 font-bold">
                    Status:
                    {" "}
                    {report.status}
                </p>

            </div>

            {/* Image */}
            {/* Media Gallery */}
            {report.mediaUrls &&
                report.mediaUrls.length > 0 && (

                    <div className="mt-4 space-y-3">

                        {report.mediaUrls.map(
                            (media, index) => (

                                media.includes(
                                    ".mp4"
                                ) ||

                                    media.includes(
                                        ".webm"
                                    ) ||

                                    media.includes(
                                        ".mov"
                                    )

                                    ? (

                                        <video
                                            key={index}
                                            controls
                                            className="rounded-xl w-full h-40 object-cover"
                                        >

                                            <source
                                                src={media}
                                            />

                                        </video>

                                    )

                                    : (

                                        <img
                                            key={index}
                                            src={media}
                                            alt="Disaster"
                                            className="rounded-xl w-full h-40 object-cover"
                                        />

                                    )

                            )
                        )}

                    </div>

                )}

        </div>

    );

}

export default MapPopup;