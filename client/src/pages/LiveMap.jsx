import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function LiveMap() {

    // Sample disaster reports
    const reports = [
        {
            id: 1,
            type: "Flood",
            location: "Pune",
            severity: "High",
            coordinates: [18.5204, 73.8567],
        },
        {
            id: 2,
            type: "Fire",
            location: "Mumbai",
            severity: "Critical",
            coordinates: [19.0760, 72.8777],
        },
    ];

    return (
        <div className="p-6">

            <h1 className="text-4xl font-bold mb-6">
                Live Disaster Map
            </h1>

            <MapContainer
                center={[18.5204, 73.8567]}
                zoom={6}
                style={{ height: "80vh", width: "100%" }}
            >

                {/* Map Tiles */}
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Disaster Markers */}
                {reports.map((report) => (
                    <Marker
                        key={report.id}
                        position={report.coordinates}
                    >
                        <Popup>
                            <div>

                                <h2 className="font-bold text-lg">
                                    {report.type}
                                </h2>

                                <p>
                                    Location: {report.location}
                                </p>

                                <p>
                                    Severity: {report.severity}
                                </p>

                            </div>
                        </Popup>
                    </Marker>
                ))}

            </MapContainer>

        </div>
    );
}

export default LiveMap;