import { BadgeCheck, Clock3, ExternalLink, MapPin, ThumbsDown, ThumbsUp, HelpCircle } from "lucide-react";

export default function MapPopup({ report, verifyIncident }) {
  const media = Array.isArray(report.mediaUrls) ? report.mediaUrls : [];
  const created = report.createdAt?.toDate?.() ||
    (report.createdAt?.seconds ? new Date(report.createdAt.seconds * 1000) : null);
  return (
    <div className="incident-popup">
      <div className="popup-top">
        <span className={"severity-tag tag-" + String(report.severity || "UNASSESSED").toLowerCase()}>
          {report.severity || "UNASSESSED"}
        </span>
        <span className="popup-status">{report.status || "PENDING"}</span>
      </div>
      <h3>{report.type || "Incident"}</h3>
      <p className="popup-description">{report.description || "No description provided."}</p>
      <div className="popup-details">
        <span><MapPin size={14} /> {report.location || "GPS location"}</span>
        {created && <span><Clock3 size={14} /> {created.toLocaleString()}</span>}
      </div>
      {!!media.length && (
        <div className="popup-media">
          {media.slice(0, 3).map((item, index) => {
            const url = typeof item === "string" ? item : item?.url;
            if (!url) return null;
            const isVideo = item?.type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(url);
            return isVideo ?
              <video key={index} src={url} controls playsInline preload="metadata" /> :
              <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={"Incident evidence " + (index + 1)} loading="lazy" />
              </a>;
          })}
        </div>
      )}
      <div className="popup-verification">
        <strong><BadgeCheck size={15} /> Community verification</strong>
        <div className="vote-actions">
          <button type="button" onClick={() => verifyIncident(report.id, "yes")}>
            <ThumbsUp size={15} /> Yes {report.verifiedYes || 0}
          </button>
          <button type="button" onClick={() => verifyIncident(report.id, "no")}>
            <ThumbsDown size={15} /> No {report.verifiedNo || 0}
          </button>
          <button type="button" onClick={() => verifyIncident(report.id, "unsure")}>
            <HelpCircle size={15} /> Unsure
          </button>
        </div>
      </div>
      <a className="popup-route" href={"https://www.google.com/maps/search/?api=1&query=" +
        report.latitude + "," + report.longitude} target="_blank" rel="noopener noreferrer">
        View location <ExternalLink size={14} />
      </a>
    </div>
  );
}
