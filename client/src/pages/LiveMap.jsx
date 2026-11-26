import { useEffect, useMemo, useState } from "react";
import {
  Circle, MapContainer, Marker, Popup, TileLayer, useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { collection, onSnapshot } from "firebase/firestore";
import L from "leaflet";
import {
  Crosshair, Layers3, MapPinned, Search, ShieldAlert, SlidersHorizontal,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import MapPopup from "../components/MapPopup";
import { apiFetch } from "../services/api";
import { db } from "../firebase";
import { useLocation } from "../context/LocationContext";
import { useCivilianSession } from "../context/CivilianSessionContext";

const ZONES = {
  CRITICAL: { color: "#c92f35", radius: 1000, fillOpacity: 0.2 },
  HIGH: { color: "#e47730", radius: 500, fillOpacity: 0.16 },
  MEDIUM: { color: "#d7a038", radius: 250, fillOpacity: 0.13 },
  LOW: { color: "#408875", radius: 250, fillOpacity: 0.13 },
  UNASSESSED: { color: "#64748b", radius: 250, fillOpacity: 0.1 },
};
const ACTIVE = new Set(["PENDING", "VERIFIED", "VERIFIED & LIVE", "NOT SURE",
  "DEPLOYED", "IN_PROGRESS", "NEEDS_REVIEW"]);
const markerIcons = Object.fromEntries(Object.entries(ZONES).map(([severity, config]) => [
  severity,
  L.divIcon({
    className: "incident-map-pin",
    html: '<div class="map-pin-dot" style="background:' + config.color + '"></div>',
    iconSize: [26, 26], iconAnchor: [13, 13],
  }),
]));

function MapFocus({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.flyTo(point, 13, { duration: 0.8 });
  }, [point, map]);
  return null;
}

function validPosition(report) {
  const lat = Number(report.latitude);
  const lon = Number(report.longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) &&
    lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 &&
    report.latitude !== null && report.latitude !== undefined &&
    report.longitude !== null && report.longitude !== undefined;
}

export default function LiveMap({ isAdmin = false }) {
  const { userLocation, requestLocation } = useLocation();
  const { loginWithRedirect } = useAuth0();
  const session = useCivilianSession();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [showZones, setShowZones] = useState(true);
  const [focus, setFocus] = useState(null);

  useEffect(() => onSnapshot(collection(db, "reports"), (snapshot) => {
    const next = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    next.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setReports(next);
    setError("");
  }, () => setError("Live incident data is temporarily unavailable. Please try again later.")), []);

  const visible = useMemo(() => reports.filter((report) =>
    validPosition(report) &&
    ACTIVE.has(report.status || "PENDING") &&
    (severity === "ALL" || (report.severity || "UNASSESSED") === severity) &&
    [report.type, report.description, report.location].join(" ").toLowerCase()
      .includes(query.toLowerCase().trim())
  ), [reports, severity, query]);

  async function vote(reportId, voteType) {
    if (!session.ready && !isAdmin) {
      toast("Sign in to verify an incident.");
      loginWithRedirect({ appState: { returnTo: "/livemap" } });
      return;
    }
    try {
      await apiFetch("/verify-incident", {
        method: "POST", body: { reportId, voteType },
      });
      toast.success("Your verification was recorded.");
    } catch (issue) {
      toast.error(issue.message || "Could not record verification.");
    }
  }

  async function locateMe() {
    try {
      const point = await requestLocation();
      setFocus(point);
    } catch (issue) {
      toast.error(issue.message || "Allow location access to center the map.");
    }
  }

  return (
    <main className={"live-map-page " + (isAdmin ? "admin-live-map" : "")}>
      <div className="map-page-header content-width">
        <div>
          <p className="section-label">Community incident monitor</p>
          <h1>Live incident map</h1>
          <p>Explore active reports across locations. Reports are community-submitted and may be unverified.</p>
        </div>
        <span className="map-count"><span className="status-dot teal" /> {visible.length} active reports</span>
      </div>
      <div className="map-workspace content-width">
        <aside className="map-sidebar">
          <div className="map-filter-heading"><SlidersHorizontal size={18} /><strong>Explore incidents</strong></div>
          <label className="map-search">
            <Search size={18} />
            <input placeholder="Search type or area" aria-label="Search incidents"
              value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="map-filter-label" htmlFor="map-severity">Severity</label>
          <select id="map-severity" className="map-select" value={severity}
            onChange={(event) => setSeverity(event.target.value)}>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "UNASSESSED"].map((value) => (
              <option key={value} value={value}>{value === "ALL" ? "All severities" : value}</option>
            ))}
          </select>
          <button type="button" className="map-toggle" onClick={() => setShowZones(!showZones)}
            aria-pressed={showZones}>
            <Layers3 size={18} /> Show severity zones
            <span className={"toggle-switch " + (showZones ? "is-on" : "")} />
          </button>
          <div className="map-sidebar-heading">Active reports <span>{visible.length}</span></div>
          <div className="map-report-list">
            {visible.length ? visible.slice(0, 80).map((report) => (
              <button key={report.id} className="map-report-card"
                onClick={() => setFocus([Number(report.latitude), Number(report.longitude)])}>
                <span className={"severity-marker severity-" + String(report.severity || "UNASSESSED").toLowerCase()} />
                <span><strong>{report.type || "Incident"}</strong>
                  <small>{report.location || "Location on map"}</small>
                  <em>{report.status || "PENDING"} • {report.severity || "UNASSESSED"}</em>
                </span>
              </button>
            )) : <p className="map-no-results">No reports match these filters.</p>}
          </div>
        </aside>
        <section className="map-surface" aria-label="Incident map">
          {error && <div className="map-error" role="alert"><ShieldAlert size={18} /> {error}</div>}
          <MapContainer center={[20.5937, 78.9629]} zoom={5}
            minZoom={3} maxZoom={18} scrollWheelZoom={true}
            className="map-leaflet">
            <TileLayer attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapFocus point={focus} />
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>Your last shared location</Popup>
              </Marker>
            )}
            {showZones && visible.map((report) => {
              const zone = ZONES[report.severity] || ZONES.UNASSESSED;
              return <Circle key={"zone-" + report.id}
                center={[Number(report.latitude), Number(report.longitude)]}
                radius={zone.radius}
                pathOptions={{
                  color: zone.color, fillColor: zone.color,
                  fillOpacity: zone.fillOpacity, weight: 1.5,
                }} />;
            })}
            <MarkerClusterGroup chunkedLoading maxClusterRadius={55}>
              {visible.map((report) => (
                <Marker key={report.id}
                  position={[Number(report.latitude), Number(report.longitude)]}
                  icon={markerIcons[report.severity] || markerIcons.UNASSESSED}>
                  <Popup maxWidth={315} minWidth={260}>
                    <MapPopup report={report} verifyIncident={vote} />
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
          <div className="map-controls">
            <button type="button" className="map-locate-button" onClick={locateMe}>
              <Crosshair size={18} /> My location
            </button>
            <div className="map-key">
              <MapPinned size={17} />
              <span><i className="key-dot key-red" /> Critical</span>
              <span><i className="key-dot key-orange" /> High</span>
              <span><i className="key-dot key-amber" /> Medium</span>
            </div>
          </div>
          <p className="map-caution">Severity circles are illustrative, not official evacuation perimeters.
            Nearby notification radius is 5 km.</p>
        </section>
      </div>
    </main>
  );
}
