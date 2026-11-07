import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

interface Stats {
  total_certificates: number;
  active_certificates: number;
  revoked_certificates: number;
  ledger_blocks: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ledger, setLedger] = useState<{valid: boolean; message: string; total_blocks: number} | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/dashboard/"), api.get("/ledger/status/")])
      .then(([a, b]) => { setStats(a.data); setLedger(b.data); })
      .catch(() => setError("Could not load dashboard. Please log in again or restart the backend."));
  }, []);

  return (
    <div>
      <div className="page-heading">
        <div><p className="eyebrow">OVERVIEW</p><h1>Admin Dashboard</h1><p className="muted">Manage and verify issued academic credentials.</p></div>
        <Link className="button" to="/add">＋ Add certificate</Link>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="stats-grid">
        <Stat label="Total certificates" value={stats?.total_certificates ?? "—"} />
        <Stat label="Active certificates" value={stats?.active_certificates ?? "—"} />
        <Stat label="Revoked certificates" value={stats?.revoked_certificates ?? "—"} />
        <Stat label="Ledger blocks" value={stats?.ledger_blocks ?? "—"} />
      </div>
      <section className="panel ledger-panel">
        <div><p className="eyebrow">BLOCKCHAIN LEDGER</p><h2>Ledger integrity</h2><p className="muted">Checks block hashes and links between previous blocks.</p></div>
        {ledger && <div className={`status-pill ${ledger.valid ? "good" : "bad"}`}>{ledger.valid ? "✓ Valid chain" : "⚠ Chain issue"}</div>}
        <p>{ledger?.message ?? "Checking ledger..."}</p>
        <small className="muted">{ledger ? `${ledger.total_blocks} blocks checked / recorded` : ""}</small>
      </section>
      <div className="quick-links">
        <Link className="quick-card" to="/add"><strong>Add a certificate</strong><span>Create a new record, hash and QR code →</span></Link>
        <Link className="quick-card" to="/certificates"><strong>View certificates</strong><span>Search, download and revoke records →</span></Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: {label: string; value: string | number}) {
  return <div className="panel stat-card"><span className="muted">{label}</span><strong>{value}</strong></div>;
}
