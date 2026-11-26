import { useCallback, useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, ClipboardList, ExternalLink, MapPin, RadioTower, RefreshCw, Truck } from "lucide-react";
import { db } from "../firebase";
import { deployIncident, getResponderIncidents, resolveIncident } from "../services/responderService";

const ACTIVE = new Set(["PENDING", "DEPLOYED", "IN_PROGRESS"]);
function timestamp(value) {
  const seconds = value?.seconds || value?._seconds;
  return seconds ? new Date(seconds * 1000).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  }) : "Recently";
}

export default function ResponderDashboard({ responderType }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const initialized = useRef(false);
  const seen = useRef(new Set());

  const refresh = useCallback(async () => {
    try {
      const data = await getResponderIncidents(responderType);
      setIncidents(data.incidents || []);
      setError("");
    } catch (issue) {
      setError(issue.message);
    } finally {
      setLoading(false);
    }
  }, [responderType]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => { if (!cancelled) await refresh(); };
    load();
    const every = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(every); };
  }, [refresh]);

  useEffect(() => {
    const filter = query(collection(db, "sosAlerts"), where("services", "array-contains", responderType));
    return onSnapshot(filter, (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type !== "added") continue;
        if (initialized.current && !seen.current.has(change.doc.id) &&
            ACTIVE.has(change.doc.data().status)) {
          toast("New " + responderType + " SOS in the queue", { icon: "🚨", duration: 7000 });
          refresh();
        }
        seen.current.add(change.doc.id);
      }
      initialized.current = true;
    }, () => setError("Real-time SOS listening is unavailable. The queue still refreshes every 30 seconds."));
  }, [responderType, refresh]);

  async function act(incident, action) {
    if (action === "resolve" && !window.confirm("Mark this request as resolved in the demo queue?")) return;
    setBusyId(incident.id);
    try {
      if (action === "deploy") await deployIncident(incident.id, incident.source);
      else await resolveIncident(incident.id, incident.source);
      toast.success(action === "deploy" ? "Response acknowledged in RescueNet" : "Request marked resolved");
      await refresh();
    } catch (issue) {
      toast.error(issue.message);
    } finally {
      setBusyId(null);
    }
  }

  const pending = incidents.filter(item => item.status === "PENDING");
  const deployed = incidents.filter(item => item.status === "DEPLOYED");
  const visible = incidents.filter(item => ACTIVE.has(item.status));

  return (
    <main className="portal-content">
      <div className="portal-section-heading">
        <div>
          <p className="section-label"><RadioTower size={15} /> Responder dispatch queue</p>
          <h1>{responderType} workspace</h1>
          <p>Department-scoped reports and SOS requests update as they arrive.</p>
        </div>
        <button onClick={refresh} className="button button-outline" type="button">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <div className="portal-stats">
        <div><span>Awaiting acknowledgement</span><strong>{pending.length}</strong><small>Pending</small></div>
        <div><span>Response recorded</span><strong>{deployed.length}</strong><small>Deployed</small></div>
        <div><span>Total active requests</span><strong>{visible.length}</strong><small>All queues</small></div>
      </div>
      {error && <p className="portal-error" role="alert"><AlertTriangle size={17}/>{error}</p>}
      {loading ? <div className="portal-empty">Loading response queue…</div> :
        visible.length === 0 ? <div className="portal-empty">
          <CheckCircle2 size={35}/><h2>No active requests</h2><p>New SOS alerts will appear here as they are saved.</p>
        </div> :
        <div className="portal-card-grid">
          {visible.map(incident => {
            const stations = incident.stations || incident.assignedStations ||
              incident.suggestedStations || [];
            return (
              <article className="portal-incident-card" key={incident.source + incident.id}>
                <div className="portal-incident-topline">
                  <span className={"portal-type " + (incident.source === "sos" ? "sos" : "")}>
                    {incident.source === "sos" ? <AlertTriangle size={14}/> : <ClipboardList size={14}/>}
                    {incident.source === "sos" ? "SOS REQUEST" : "INCIDENT REPORT"}
                  </span>
                  <span className="portal-status">{incident.status}</span>
                </div>
                <h2>{incident.type || (incident.services || []).join(" + ") || "Emergency request"}</h2>
                <p className="portal-incident-location"><MapPin size={16}/>
                  {incident.location || "Location available in map coordinates"}</p>
                <p className="portal-card-date">{timestamp(incident.createdAt)}</p>
                <div className="portal-station-list">
                  <span className="portal-card-subtitle">Nearby facility suggestions</span>
                  {stations.length ? stations.slice(0, 3).map((station, index) =>
                    <div key={station.id || index} className="portal-station-row">
                      <span>{station.name}<small>{station.type} · {station.source === "sample" ? "sample location" : "OpenStreetMap"}</small></span>
                      <strong>{station.distance} km</strong>
                    </div>
                  ) : <p>No verified nearby facility was found.</p>}
                  <small>Facilities are suggestions, not confirmed dispatch recipients.</small>
                </div>
                {incident.latitude != null && incident.longitude != null &&
                  <a className="portal-map-link" href={"https://www.google.com/maps/dir/?api=1&destination=" +
                    encodeURIComponent(incident.latitude + "," + incident.longitude)}
                    target="_blank" rel="noopener noreferrer">
                    <MapPin size={15}/> Open directions <ExternalLink size={13}/>
                  </a>}
                <div className="portal-card-actions">
                  <button className="button button-outline" type="button" disabled={!!busyId || incident.status !== "PENDING"}
                    onClick={() => act(incident, "deploy")}>
                    <Truck size={16}/> Acknowledge
                  </button>
                  <button className="button button-primary" type="button" disabled={!!busyId}
                    onClick={() => act(incident, "resolve")}>
                    <CheckCircle2 size={16}/> Resolve
                  </button>
                </div>
              </article>
            );
          })}
        </div>}
    </main>
  );
}
