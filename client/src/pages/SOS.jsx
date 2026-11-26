import { useRef, useState } from "react";
import {
  Ambulance, ArrowRight, CheckCircle2, ExternalLink, Flame,
  LoaderCircle, MapPin, ShieldAlert, ShieldCheck, Siren,
} from "lucide-react";
import { apiFetch } from "../services/api";
import { useLocation } from "../context/LocationContext";

const services = [
  { value: "Police", icon: ShieldCheck, detail: "Security and law enforcement" },
  { value: "Ambulance", icon: Ambulance, detail: "Medical care and transport" },
  { value: "Fire Brigade", icon: Flame, detail: "Fire and rescue response" },
];

export default function SOS() {
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const { requestLocation } = useLocation();
  const requestKey = useRef(crypto.randomUUID());

  function toggle(value) {
    setSelected((current) => current.includes(value) ?
      current.filter((item) => item !== value) : [...current, value]);
  }

  async function submit(event) {
    event.preventDefault();
    if (!selected.length) {
      setError("Choose at least one service.");
      return;
    }
    setError("");
    setResult(null);
    setSending(true);
    try {
      const [latitude, longitude] = await requestLocation();
      let location = latitude.toFixed(5) + ", " + longitude.toFixed(5);
      try {
        const lookup = await fetch(
          "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
          latitude + "&lon=" + longitude,
          { signal: AbortSignal.timeout(5000) }
        );
        const address = (await lookup.json()).address || {};
        location = address.suburb || address.neighbourhood || address.city ||
          address.town || address.village || location;
      } catch { /* GPS coordinates are sufficient */ }
      const response = await apiFetch("/send-sos", {
        method: "POST",
        body: {
          services: selected, latitude, longitude, location,
          requestKey: requestKey.current,
        },
      });
      setResult(response);
      requestKey.current = crypto.randomUUID();
    } catch (issue) {
      setError(issue.message || "SOS request could not be saved. Contact local emergency services directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="sos-page content-width">
      <div className="sos-intro">
        <div className="sos-symbol"><Siren size={30} /></div>
        <p className="section-label">Emergency requests</p>
        <h1>Emergency SOS</h1>
        <p>Choose the services needed at your location. RescueNet will save a
          demonstration request and suggest nearby facilities.</p>
      </div>
      <div className="demo-warning" role="note">
        <ShieldAlert size={22} />
        <div><strong>This is not a live emergency dispatch service.</strong>
          <p>No police station, hospital, or fire brigade will be contacted by this action.
            Call official local emergency services for immediate help.</p></div>
      </div>
      <form onSubmit={submit} className="sos-form">
        <h2>Which services do you need?</h2>
        <div className="service-options">
          {services.map((service) => (
            <label key={service.value}
              className={"service-option " + (selected.includes(service.value) ? "is-selected" : "")}>
              <input type="checkbox" checked={selected.includes(service.value)}
                onChange={() => toggle(service.value)} />
              <span className="service-symbol"><service.icon size={25} /></span>
              <span className="service-copy"><strong>{service.value}</strong><small>{service.detail}</small></span>
              <span className="service-check" aria-hidden="true">{selected.includes(service.value) ? "✓" : ""}</span>
            </label>
          ))}
        </div>
        {error && <div className="form-error" role="alert"><ShieldAlert size={19} /> {error}</div>}
        <button type="submit" className="button sos-submit" disabled={sending}>
          {sending ? <><LoaderCircle className="animate-spin" size={20} /> Saving request…</> :
            <><Siren size={23} /> Save demonstration SOS <ArrowRight size={20} /></>}
        </button>
        <p className="sos-privacy"><MapPin size={15} /> GPS is requested only when you send an SOS.</p>
      </form>

      {result && (
        <div className="sos-result" role="status">
          <div className="sos-result-heading">
            <CheckCircle2 size={27} />
            <div><h2>Request saved</h2><p>{result.message || "Demo request recorded."}</p></div>
          </div>
          <h3>Nearest suggested facilities</h3>
          {result.suggestedStations?.length ? (
            <div className="station-suggestions">
              {result.suggestedStations.map((station) => (
                <div className="station-suggestion" key={station.id}>
                  <span><strong>{station.name}</strong><small>{station.type} • {station.source === "openstreetmap" ?
                    "OpenStreetMap data" : "Sample data"}</small></span>
                  <span className="station-distance">{station.distance} km</span>
                  <a href={"https://www.google.com/maps/dir/?api=1&destination=" +
                    station.latitude + "," + station.longitude}
                    target="_blank" rel="noopener noreferrer" aria-label={"Directions to " + station.name}>
                    <ExternalLink size={17} />
                  </a>
                </div>
              ))}
            </div>
          ) : <p>No nearby facilities could be found. Use official emergency channels.</p>}
          <p className="suggestion-caution">Facilities are suggestions only. Availability, opening hours, and
            acceptance of dispatch have not been verified.</p>
        </div>
      )}
    </main>
  );
}
