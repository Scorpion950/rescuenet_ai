import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import { Archive, CheckCircle2, ClipboardList, ExternalLink, FileVideo, Filter, MapPin } from "lucide-react";
import { db } from "../../firebase";
import { apiFetch } from "../../services/api";
import { updateIncidentStatus } from "../../services/statusService";

const FILTERS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "UNASSESSED", "PENDING", "VERIFIED", "NEEDS_REVIEW", "RESOLVED"];
const CLOSED = ["RESOLVED", "ARCHIVED", "REJECTED"];
const displayTime = (value) => value?.seconds ? new Date(value.seconds * 1000).toLocaleString("en-IN") : "Recently";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [working, setWorking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(collection(db, "reports"), (snapshot) => {
    setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
  }, () => setError("Report feed unavailable. Check your network and Firebase permissions.")), []);

  const visible = useMemo(() => reports.filter(report =>
    report.status !== "ARCHIVED" &&
    (filter === "ALL" || report.severity === filter || report.status === filter)
  ), [reports, filter]);

  async function change(report, action) {
    const message = action === "archive"
      ? "Archive this report while preserving an audit trail?"
      : "Mark this report resolved in RescueNet?";
    if (!window.confirm(message)) return;
    setWorking(report.id);
    try {
      if (action === "archive") await apiFetch("/reports/" + encodeURIComponent(report.id), { method: "DELETE" });
      else await updateIncidentStatus(report.id, "RESOLVED", "report");
      toast.success(action === "archive" ? "Report archived" : "Report marked resolved");
    } catch (issue) { toast.error(issue.message); }
    finally { setWorking(null); }
  }

  return (
    <main className="portal-content">
      <div className="portal-section-heading">
        <div><p className="section-label"><ClipboardList size={16}/> Administration / reports</p>
          <h1>Incident reports</h1><p>Review community submissions and manage their lifecycle.</p></div>
        <span className="portal-count">{visible.length} results</span>
      </div>
      {error && <p className="portal-error" role="alert">{error}</p>}
      <div className="admin-filters" aria-label="Filter reports"><Filter size={17}/>
        {FILTERS.map(value => <button key={value} type="button" onClick={() => setFilter(value)}
          aria-pressed={filter === value} className={filter === value ? "selected" : ""}>{value}</button>)}
      </div>
      {visible.length === 0 ? <div className="portal-empty"><ClipboardList size={32}/><h2>No matching reports</h2></div> :
        <div className="portal-card-grid">
          {visible.map(report =>
            <article className="portal-incident-card" key={report.id}>
              <div className="portal-incident-topline">
                <span className={"admin-severity severity-" + (report.severity || "unassessed").toLowerCase()}>
                  {report.severity || "UNASSESSED"}</span>
                <span className="portal-status">{report.status || "PENDING"}</span>
              </div>
              <h2>{report.type || "Incident"}</h2>
              <p className="portal-incident-location"><MapPin size={15}/>{report.location || "Map coordinates"}</p>
              <p className="portal-card-date">{displayTime(report.createdAt)}</p>
              <p className="admin-report-description">{report.description}</p>
              <div className="admin-review-summary">
                <span>Yes <strong>{report.verifiedYes || 0}</strong></span>
                <span>No <strong>{report.verifiedNo || 0}</strong></span>
                <span>Unsure <strong>{report.verifiedUnsure || 0}</strong></span>
              </div>
              {report.mediaUrls?.length > 0 &&
                <div className="admin-media-grid">
                  {report.mediaUrls.slice(0, 3).map((item, i) => {
                    const url = typeof item === "string" ? item : item.url;
                    const isVideo = item.type === "video";
                    return <a href={url} target="_blank" rel="noopener noreferrer" key={url + i}
                      aria-label={"Open incident evidence " + (i + 1)}>
                      {isVideo ? <div className="admin-video-thumb"><FileVideo size={26}/><small>View video</small></div> :
                        <img loading="lazy" src={url} alt={"Report evidence " + (i + 1)}/>}
                    </a>;
                  })}
                </div>}
              {report.latitude != null && report.longitude != null &&
                <a className="portal-map-link" target="_blank" rel="noopener noreferrer"
                  href={"https://www.google.com/maps?q=" + encodeURIComponent(report.latitude + "," + report.longitude)}>
                  Open incident location <ExternalLink size={14}/></a>}
              <div className="portal-card-actions">
                <button type="button" className="button button-outline"
                  disabled={working === report.id || CLOSED.includes(report.status)}
                  onClick={() => change(report, "resolve")}><CheckCircle2 size={15}/> Resolve</button>
                <button type="button" className="button button-primary"
                  disabled={working === report.id} onClick={() => change(report, "archive")}>
                  <Archive size={15}/> Archive</button>
              </div>
            </article>)}
        </div>}
    </main>
  );
}
