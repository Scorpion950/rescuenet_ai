import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import { Archive, CheckCircle2, ExternalLink, MapPin, Siren, TriangleAlert } from "lucide-react";
import { db } from "../../firebase";
import { apiFetch } from "../../services/api";
import { updateIncidentStatus } from "../../services/statusService";

export default function AdminSOS() {
  const [alerts, setAlerts] = useState([]);
  const [working, setWorking] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => onSnapshot(collection(db, "sosAlerts"), (snapshot) => {
    setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
  }, () => setError("SOS feed unavailable. Check network connectivity and role permissions.")), []);

  const visible = alerts.filter(item => item.status !== "ARCHIVED");
  const open = visible.filter(item => !["RESOLVED", "REJECTED"].includes(item.status)).length;

  async function change(alert, action) {
    if (!window.confirm(action === "archive"
      ? "Archive this SOS while preserving the audit history?"
      : "Mark this SOS request as resolved in RescueNet?")) return;
    setWorking(alert.id);
    try {
      if (action === "archive") await apiFetch("/sos/" + encodeURIComponent(alert.id), { method: "DELETE" });
      else await updateIncidentStatus(alert.id, "RESOLVED", "sos");
      toast.success(action === "archive" ? "SOS archived" : "SOS marked resolved");
    } catch (issue) { toast.error(issue.message); }
    finally { setWorking(null); }
  }

  return (
    <main className="portal-content">
      <div className="portal-section-heading">
        <div><p className="section-label"><Siren size={15}/> Administration / priority queue</p>
          <h1>Emergency SOS requests</h1>
          <p>Review requests, nearby facility suggestions, and closure status.</p></div>
        <span className="portal-count">{open} active requests</span>
      </div>
      {error && <p className="portal-error" role="alert">{error}</p>}
      {visible.length === 0 ? <div className="portal-empty"><CheckCircle2 size={33}/><h2>No SOS requests yet</h2></div> :
        <div className="portal-card-grid">
          {visible.map(alert =>
            <article className="portal-incident-card" key={alert.id}>
              <div className="portal-incident-topline">
                <span className="portal-type sos"><TriangleAlert size={15}/> SOS REQUEST</span>
                <span className="portal-status">{alert.status || "PENDING"}</span>
              </div>
              <h2>{(alert.services || []).join(" + ") || "Emergency"}</h2>
              <p className="portal-incident-location"><MapPin size={16}/>
                {alert.location || "Location from GPS"}</p>
              <p className="portal-card-date">{alert.createdAt?.seconds ?
                new Date(alert.createdAt.seconds * 1000).toLocaleString("en-IN") : "Recently"}</p>
              <div className="portal-station-list">
                <strong className="portal-card-subtitle">Nearby facility suggestions</strong>
                {(alert.suggestedStations || alert.assignedStations || []).length ?
                  (alert.suggestedStations || alert.assignedStations).slice(0, 3).map((station, index) =>
                    <div className="portal-station-row" key={station.id || index}>
                      <span>{station.name}<small>{station.type} · {station.source || "legacy record"}</small></span>
                      <strong>{station.distance} km</strong>
                    </div>
                  ) : <p>No nearby facilities could be found.</p>}
                <small>Suggestions only; no external service has received this request automatically.</small>
              </div>
              {alert.latitude != null && alert.longitude != null &&
                <a className="portal-map-link" target="_blank" rel="noopener noreferrer"
                  href={"https://www.google.com/maps?q=" + encodeURIComponent(alert.latitude + "," + alert.longitude)}>
                  View location <ExternalLink size={14}/>
                </a>}
              <div className="portal-card-actions">
                <button type="button" className="button button-outline"
                  disabled={working === alert.id || ["RESOLVED", "REJECTED"].includes(alert.status)}
                  onClick={() => change(alert, "resolve")}><CheckCircle2 size={15}/> Resolve</button>
                <button type="button" className="button button-primary" disabled={working === alert.id}
                  onClick={() => change(alert, "archive")}><Archive size={15}/> Archive</button>
              </div>
            </article>)}
        </div>}
    </main>
  );
}
