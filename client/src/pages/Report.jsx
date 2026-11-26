import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Camera, CheckCircle2, Crosshair, FileImage,
  Info, LoaderCircle, MapPin, ShieldAlert, Trash2, UploadCloud,
} from "lucide-react";
import { apiFetch } from "../services/api";
import { useLocation } from "../context/LocationContext";

const INCIDENT_TYPES = ["Accident", "Medical", "Fire", "Flood", "Crime", "Other"];
const MAX_FILES = 5;
const IMAGE_MAX = 8 * 1024 * 1024;
const VIDEO_MAX = 35 * 1024 * 1024;

function MediaPreview({ file, remove }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);
  return (
    <div className="media-preview">
      {file.type.startsWith("video/") ?
        <video src={url || undefined} muted playsInline aria-label={"Selected video " + file.name} /> :
        <img src={url || undefined} alt={"Selected file " + file.name} />}
      <button type="button" className="media-remove" aria-label={"Remove " + file.name} onClick={remove}>
        <Trash2 size={15} />
      </button>
      <small>{file.name}</small>
    </div>
  );
}

async function uploadMedia(file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) throw new Error("Media upload is not configured on this site.");
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);
  const response = await fetch("https://api.cloudinary.com/v1_1/" + cloud + "/auto/upload", {
    method: "POST", body,
  });
  const result = await response.json();
  if (!response.ok || !result.secure_url ||
      !["image", "video"].includes(result.resource_type)) {
    throw new Error(result.error?.message || "A media file could not be uploaded.");
  }
  return { url: result.secure_url, type: result.resource_type };
}

export default function Report() {
  const { userLocation, requestLocation } = useLocation();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [media, setMedia] = useState([]);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function locate() {
    setError("");
    try {
      const [lat, lon] = await requestLocation();
      setArea(lat.toFixed(5) + ", " + lon.toFixed(5));
      try {
        const response = await fetch(
          "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
          lat + "&lon=" + lon,
          { signal: AbortSignal.timeout(7000) }
        );
        const data = await response.json();
        const address = data.address || {};
        setArea(address.suburb || address.neighbourhood || address.city ||
          address.town || address.village || address.county || "GPS location");
      } catch { /* coordinates remain valid even if reverse geocoding fails */ }
    } catch (issue) {
      setError(issue?.message || "Could not access your location. Check browser permissions.");
    }
  }

  function addFiles(list) {
    const incoming = Array.from(list || []);
    const accepted = incoming.filter((file) =>
      (file.type.startsWith("image/") && file.size <= IMAGE_MAX) ||
      (file.type.startsWith("video/") && file.size <= VIDEO_MAX)
    );
    if (accepted.length !== incoming.length) {
      setError("Images must be under 8 MB and videos under 35 MB.");
    }
    setMedia((current) => [...current, ...accepted].slice(0, MAX_FILES));
    if (media.length + accepted.length > MAX_FILES) {
      setError("A report can include up to five photos or videos.");
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!userLocation) {
      setError("Use the location button to add the incident's GPS position.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Describe what happened in at least 10 characters.");
      return;
    }
    setBusy(true);
    try {
      const mediaUrls = [];
      for (let index = 0; index < media.length; index++) {
        setStep("Uploading evidence " + (index + 1) + " of " + media.length + "…");
        mediaUrls.push(await uploadMedia(media[index]));
      }
      setStep("Saving incident and running analysis…");
      const response = await apiFetch("/reports", {
        method: "POST",
        body: {
          type, description, location: area || "GPS location",
          latitude: userLocation[0],
          longitude: userLocation[1],
          mediaUrls,
        },
      });
      setResult(response);
      setDescription("");
      setType("");
      setMedia([]);
      setStep("");
    } catch (issue) {
      setError(issue.message || "Report could not be saved. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="form-page content-width">
      <div className="page-heading">
        <p className="section-label">Community reporting</p>
        <h1>Report an incident</h1>
        <p>Share what you can see. Accurate reports help people nearby understand the situation.</p>
      </div>
      <div className="form-layout">
        <form className="form-panel" onSubmit={submit}>
          <div className="panel-title">
            <span className="panel-icon"><FileImage size={22} /></span>
            <div><h2>Incident details</h2><p>Provide clear, factual information.</p></div>
          </div>
          <div className="field-group">
            <label htmlFor="incident-type">What happened?</label>
            <select id="incident-type" className="field-input" required value={type}
              onChange={(event) => setType(event.target.value)}>
              <option value="">Choose incident type</option>
              {INCIDENT_TYPES.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="incident-description">Describe the situation</label>
            <textarea id="incident-description" className="field-input" required minLength={10}
              maxLength={2000} rows={5} value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What happened? Is anyone injured? Are there immediate dangers?" />
            <small>{description.length} / 2000 characters</small>
          </div>
          <div className="field-group">
            <label>Incident location</label>
            <div className="location-field">
              <MapPin size={20} />
              <span>{userLocation ? area || "GPS position acquired" : "Location not shared yet"}</span>
              <button type="button" className="button button-outline" onClick={locate}>
                <Crosshair size={17} /> {userLocation ? "Refresh" : "Use GPS"}
              </button>
            </div>
            <small>Location is required for nearby warnings. Confirm that you are at the incident.</small>
          </div>
          <div className="field-group">
            <label>Evidence <span className="optional-label">(optional)</span></label>
            <div className="media-actions">
              <button className="upload-option" type="button" onClick={() => fileRef.current?.click()}>
                <UploadCloud size={21} /> Add photos or videos
              </button>
              <button className="upload-option" type="button" onClick={() => cameraRef.current?.click()}>
                <Camera size={21} /> Use camera
              </button>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*"
              className="sr-only" onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }} />
            <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment"
              className="sr-only" onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }} />
            <small>Up to 5 files • 8 MB per image • 35 MB per video</small>
            {!!media.length && <div className="media-grid">
              {media.map((file, index) => <MediaPreview key={file.name + index}
                file={file} remove={() => setMedia((current) =>
                  current.filter((_, i) => i !== index))} />)}
            </div>}
          </div>
          {error && <div className="form-error" role="alert"><ShieldAlert size={19} /> {error}</div>}
          {result && (
            <div className="form-success" role="status">
              <CheckCircle2 size={23} />
              <div>
                <strong>Incident saved</strong>
                <p>Severity: {result.triage?.severity || "UNASSESSED"}.
                  Facilities shown are suggestions; no service has been contacted.</p>
                <Link to="/livemap">See it on the map <ArrowRight size={14} /></Link>
              </div>
            </div>
          )}
          <button className="button button-primary form-submit" type="submit" disabled={busy}>
            {busy ? <><LoaderCircle className="animate-spin" size={19} /> {step || "Saving…"}</> :
              <>Save incident report <ArrowRight size={19} /></>}
          </button>
        </form>
        <aside className="form-aside">
          <div className="aside-card">
            <Info size={23} />
            <h2>Before you report</h2>
            <p>Only report incidents you witnessed or can reliably describe.
              Avoid sharing identifiable photos of victims or private details.</p>
            <ul>
              <li>Use an accurate location.</li>
              <li>Include relevant evidence when safe.</li>
              <li>Don't put yourself at risk to capture footage.</li>
            </ul>
          </div>
          <div className="aside-emergency">
            <ShieldAlert size={23} />
            <h3>Is someone in immediate danger?</h3>
            <p>Contact official emergency services directly. RescueNet is not an emergency hotline.</p>
            <Link to="/sos">Open demonstration SOS <ArrowRight size={15} /></Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
