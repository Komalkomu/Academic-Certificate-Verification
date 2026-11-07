import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login/", { username, password });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      onLogin();
      navigate("/");
    } catch {
      setError("Login failed. Check your username and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-wrap">
      <form className="panel login-panel" onSubmit={submit}>
        <div className="logo-mark">🎓</div>
        <p className="eyebrow">ADMIN PORTAL</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage academic certificates.</p>
        {error && <div className="alert error">{error}</div>}
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="button full" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        <small className="muted">Local demo credentials are prefilled. Change them in your .env file.</small>
      </form>
    </section>
  );
}
