import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { LockKeyhole, ShieldCheck, ArrowRight } from "lucide-react";
import { auth } from "../firebase";

export default function AdminLogin() {
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
      if (token.claims.role !== "admin") {
        await signOut(auth);
        throw new Error("This account has not been assigned administrator access.");
      }
      navigate("/admin", { replace: true });
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
        <div className="portal-icon"><ShieldCheck size={25} /></div>
        <p className="section-label">Secure access / administration</p>
        <h1>Administrator sign in</h1>
        <p>Use an individual Firebase account granted the administrator role by your project operator.</p>
        <form onSubmit={login} className="portal-signin-form">
          <label htmlFor="admin-email">Email address</label>
          <input id="admin-email" autoComplete="username" type="email" required
            value={email} onChange={event => setEmail(event.target.value)}
            placeholder="operator@example.com" />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" autoComplete="current-password" type="password" required
            value={password} onChange={event => setPassword(event.target.value)}
            placeholder="Your account password" />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button disabled={pending} className="button button-primary" type="submit">
            <LockKeyhole size={18} /> {pending ? "Verifying account…" : "Sign in securely"} <ArrowRight size={17} />
          </button>
        </form>
        <p className="portal-signin-note">Role permissions are verified server-side. Shared admin keys have been retired.</p>
        <Link to="/">Return to RescueNet <ArrowRight size={14} /></Link>
      </div>
    </main>
  );
}
