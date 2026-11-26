import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ArrowRight, RadioTower, ShieldCheck } from "lucide-react";
import { auth } from "../firebase";

const DESTINATIONS = {
  Police: "/responder/police",
  Ambulance: "/responder/ambulance",
  "Fire Brigade": "/responder/fire",
};

export default function ResponderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function login(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await credential.user.getIdTokenResult(true);
      const path = DESTINATIONS[token.claims.department];
      if (token.claims.role !== "responder" || !path) {
        await signOut(auth);
        throw new Error("This account has no approved responder department.");
      }
      navigate(path, { replace: true });
    } catch (issue) {
      setError(issue.code === "auth/invalid-credential"
        ? "Email or password is incorrect." : issue.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="portal-signin-page">
      <div className="portal-signin-card">
        <div className="portal-icon"><RadioTower size={25} /></div>
        <p className="section-label">Secure access / response teams</p>
        <h1>Responder sign in</h1>
        <p>Sign in with your assigned team account. Your police, ambulance, or fire queue is selected from verified permissions.</p>
        <form className="portal-signin-form" onSubmit={login}>
          <label htmlFor="responder-email">Work email</label>
          <input id="responder-email" type="email" autoComplete="username" required
            placeholder="responder@example.com" value={email}
            onChange={event => setEmail(event.target.value)} />
          <label htmlFor="responder-password">Password</label>
          <input id="responder-password" type="password" autoComplete="current-password" required
            placeholder="Your account password" value={password}
            onChange={event => setPassword(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={pending}>
            <ShieldCheck size={18} /> {pending ? "Checking permissions…" : "Open responder workspace"}
            <ArrowRight size={17} />
          </button>
        </form>
        <p className="portal-signin-note">A responder account does not automatically establish dispatch connectivity with external emergency services.</p>
        <Link to="/">Return to RescueNet <ArrowRight size={14} /></Link>
      </div>
    </main>
  );
}
