import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, BellRing, ClipboardList, Crosshair,
  MapPin, RadioTower, ShieldAlert, ShieldCheck, Siren,
} from "lucide-react";
import useNearbyAlerts from "../hooks/useNearbyAlerts";
import { useLocation } from "../context/LocationContext";

const steps = [
  { icon: ClipboardList, title: "Report what happened", copy: "Share the location, a short description, and photos or videos." },
  { icon: Crosshair, title: "See the area at risk", copy: "Incidents appear on a shared map with clear severity indicators." },
  { icon: BellRing, title: "Keep people informed", copy: "Opted-in users near an incident can receive timely local alerts." },
];

export default function Home() {
  const nearby = useNearbyAlerts();
  const { userLocation, requestLocation } = useLocation();
  return (
    <main className="home-page">
      <section className="hero-section content-width">
        <div className="hero-copy">
          <div className="operational-note">
            <span className="note-indicator" />
            Community incident awareness platform
          </div>
          <h1>Know what's happening around you.</h1>
          <p className="hero-lead">
            Report an incident, explore local danger zones, and help your community
            stay informed through one shared, real-time map.
          </p>
          <div className="hero-actions">
            <Link to="/report" className="button button-primary">
              <ClipboardList size={19} /> Report an incident <ArrowRight size={18} />
            </Link>
            <Link to="/livemap" className="button button-outline">
              <MapPin size={19} /> Explore the live map
            </Link>
          </div>
          <div className="hero-trust">
            <ShieldCheck size={19} />
            <p>Community reports are unverified until reviewed. RescueNet is a
              demonstration, not a replacement for official emergency services.</p>
          </div>
        </div>
        <div className="situation-panel" aria-label="Illustrative incident monitoring interface">
          <div className="situation-heading">
            <span><RadioTower size={18} /> Situation awareness</span>
            <span className="simulation-tag">Illustration</span>
          </div>
          <div className="map-art" aria-hidden="true">
            <div className="map-road road-one" />
            <div className="map-road road-two" />
            <div className="map-road road-three" />
            <div className="map-road road-four" />
            <div className="map-ring ring-out" />
            <div className="map-ring ring-in" />
            <span className="map-signal"><Siren size={19} /></span>
            <span className="map-safe safe-one" />
            <span className="map-safe safe-two" />
            <span className="map-safe safe-three" />
            <span className="map-city city-one">NORTH DISTRICT</span>
            <span className="map-city city-two">RIVERSIDE</span>
          </div>
          <div className="situation-bottom">
            <div><span className="status-dot red" /> <strong>Incident reported</strong><p>Location-based awareness</p></div>
            <div><span className="status-dot teal" /> <strong>Nearby residents</strong><p>Consent-based alerts</p></div>
          </div>
        </div>
      </section>

      <section className="local-alerts-section content-width" aria-label="Nearby incidents">
        <div className="section-split">
          <div>
            <p className="section-label">In your area</p>
            <h2>Nearby incident alerts</h2>
          </div>
          {!userLocation && (
            <button className="button button-outline" onClick={() => requestLocation().catch(() => {})}>
              <Crosshair size={17} /> Check my area
            </button>
          )}
        </div>
        {nearby.length > 0 ? (
          <div className="nearby-list">
            {nearby.slice(0, 3).map((item) => (
              <Link className="nearby-row" key={item.id} to="/livemap">
                <span className={"severity-marker severity-" + String(item.severity || "UNASSESSED").toLowerCase()} />
                <span><strong>{item.type}</strong><small>{item.location || "Location on map"}</small></span>
                <span className="nearby-status">{item.status || "PENDING"}</span>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="nearby-empty">
            <ShieldCheck size={22} />
            <span>{userLocation ? "No active reports within 5 km of your location." :
              "Check your area to see incidents within a 5 km radius."}</span>
          </div>
        )}
      </section>

      <section className="workflow-section content-width">
        <div className="section-intro">
          <p className="section-label">How it works</p>
          <h2>Information that moves with the situation.</h2>
          <p>From first report to local awareness, every step is built for clarity.</p>
        </div>
        <div className="workflow-grid">
          {steps.map((step, index) => (
            <article className="workflow-step" key={step.title}>
              <div className="workflow-number">0{index + 1}</div>
              <step.icon size={26} strokeWidth={1.8} />
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sos-ribbon content-width">
        <div className="sos-icon"><ShieldAlert size={28} /></div>
        <div>
          <h2>Need urgent help?</h2>
          <p>Send a demonstration SOS request to the responder dashboard.
            For a real emergency, call your local emergency number immediately.</p>
        </div>
        <Link to="/sos" className="button button-danger">Open SOS <ArrowRight size={18} /></Link>
      </section>
    </main>
  );
}
