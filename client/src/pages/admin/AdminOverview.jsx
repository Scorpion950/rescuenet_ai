import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { ArrowRight, BellRing, ClipboardCheck, ClipboardList, MapPinned, RadioTower, Siren, TriangleAlert } from "lucide-react";
import { db } from "../../firebase";

const OPEN = (status) => !["RESOLVED", "ARCHIVED", "REJECTED"].includes(status);
function dateTime(timestamp) {
  return timestamp?.seconds ? new Date(timestamp.seconds * 1000).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  }) : "Recently";
}

export default function AdminOverview() {
  const [reports, setReports] = useState([]);
  const [sos, setSos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribeReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, () => setError("Reports feed unavailable. Check Firebase permissions and connectivity."));
    const unsubscribeSOS = onSnapshot(collection(db, "sosAlerts"), (snapshot) => {
      setSos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, () => setError("SOS feed unavailable. Check Firebase permissions and connectivity."));
    return () => { unsubscribeReports(); unsubscribeSOS(); };
  }, []);

  const activeReports = reports.filter(report => OPEN(report.status));
  const activeSOS = sos.filter(alert => OPEN(alert.status));
  const severe = activeReports.filter(report => ["CRITICAL", "HIGH"].includes(report.severity));
  const reviewed = reports.filter(report => report.status === "VERIFIED");
  const latest = [
    ...activeReports.map(report => ({ ...report, kind: "Incident", name: report.type || "Report" })),
    ...activeSOS.map(alert => ({ ...alert, kind: "SOS", name: (alert.services || []).join(" + ") || "SOS" })),
  ].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 6);
  const cards = [
    { label: "Open reports", value: activeReports.length, Icon: ClipboardList, tone: "teal" },
    { label: "Active SOS", value: activeSOS.length, Icon: Siren, tone: "red" },
    { label: "High-priority reports", value: severe.length, Icon: TriangleAlert, tone: "amber" },
    { label: "Community verified", value: reviewed.length, Icon: ClipboardCheck, tone: "blue" },
  ];

  return (
    <main className="portal-content">
      <div className="portal-section-heading">
        <div>
          <p className="section-label"><RadioTower size={15}/> Command center / live overview</p>
          <h1>Situation overview</h1>
          <p>Real-time activity from reports, SOS requests, and community verification.</p>
        </div>
        <span className="portal-live-tag"><span/> Firestore live feed</span>
      </div>
      {error && <p className="portal-error" role="alert">{error}</p>}
      <div className="admin-stat-grid">
        {cards.map(({ label, value, Icon, tone }) =>
          <div className="admin-stat-card" key={label}>
            <div className={"admin-stat-icon " + tone}><Icon size={23}/></div>
            <strong>{value}</strong><span>{label}</span>
          </div>
        )}
      </div>
      <div className="admin-overview-grid">
        <section className="admin-overview-panel">
          <header><div><p className="section-label">Activity</p><h2>Recent active requests</h2></div><BellRing size={20}/></header>
          {latest.length === 0 ? <p className="admin-empty-inline">No active requests recorded yet.</p> :
            latest.map(item =>
              <div key={item.kind + item.id} className="admin-activity-row">
                <span className={"admin-activity-icon " + (item.kind === "SOS" ? "sos" : "")}>
                  {item.kind === "SOS" ? <Siren size={19}/> : <ClipboardList size={19}/>}
                </span>
                <div><strong>{item.name}</strong><small>{item.location || "GPS location"} · {dateTime(item.createdAt)}</small></div>
                <span className="admin-activity-tag">{item.kind}</span>
              </div>
            )}
        </section>
        <section className="admin-overview-panel">
          <header><div><p className="section-label">Operations</p><h2>Go to workspace</h2></div><MapPinned size={21}/></header>
          {[
            { to: "/admin/reports", title: "Review incident reports", detail: "Verify, resolve, and archive reports", Icon: ClipboardList },
            { to: "/admin/sos", title: "Manage SOS requests", detail: "Review and close demo requests", Icon: Siren },
            { to: "/admin/map", title: "Explore the live map", detail: "Check active reports and zones", Icon: MapPinned },
          ].map(item =>
            <Link className="admin-workspace-link" key={item.to} to={item.to}>
              <item.Icon size={19}/><span><strong>{item.title}</strong><small>{item.detail}</small></span>
              <ArrowRight size={18}/>
            </Link>
          )}
          <div className="admin-demo-callout">
            <TriangleAlert size={19}/><p>Dispatch and facility matching are demonstrations. No external station is automatically notified or confirmed available.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
