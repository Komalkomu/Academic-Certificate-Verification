import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Certificate } from "../types";

export default function AddCertificate() {
  const [form, setForm] = useState({student_name: "", usn: "", course: "", certificate_id: "", issue_date: ""});
  const [pdf, setPdf] = useState<File | null>(null);
  const [created, setCreated] = useState<Certificate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(key: string, value: string) {
    setForm((old) => ({...old, [key]: value}));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setCreated(null);
    if (!pdf) { setError("Please choose the certificate PDF."); return; }
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("pdf_file", pdf);
    setLoading(true);
    try {
      const response = await api.post("/certificates/", data);
      setCreated(response.data);
      setForm({student_name: "", usn: "", course: "", certificate_id: "", issue_date: ""});
      setPdf(null);
      const fileInput = document.getElementById("pdf_file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not create certificate. Check the details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="narrow">
      <p className="eyebrow">CERTIFICATE MANAGEMENT</p><h1>Add new certificate</h1>
      <p className="muted">The system will create a SHA-256 hash, QR code and ledger block automatically.</p>
      {error && <div className="alert error">{error}</div>}
      {created && <div className="panel success-panel">
        <h2>✓ Certificate created successfully</h2>
        <p><strong>Certificate ID:</strong> {created.certificate_id}</p>
        <p><strong>SHA-256:</strong></p><code className="hash">{created.sha256_hash}</code>
        <p><strong>Ledger block:</strong> #{created.block_index}</p>
        {created.qr_url && <img className="qr-image" src={created.qr_url} alt="Certificate QR code" />}
        <p><Link to={`/verify/${created.certificate_id}`}>Open public verification page →</Link></p>
      </div>}
      <form className="panel form-panel" onSubmit={submit}>
        <div className="form-grid">
          <Field label="Student full name"><input value={form.student_name} onChange={e => change("student_name", e.target.value)} required /></Field>
          <Field label="USN"><input value={form.usn} onChange={e => change("usn", e.target.value)} required /></Field>
          <Field label="Course / Programme"><input value={form.course} onChange={e => change("course", e.target.value)} placeholder="e.g. B.E. Computer Science" required /></Field>
          <Field label="Certificate ID"><input value={form.certificate_id} onChange={e => change("certificate_id", e.target.value)} placeholder="e.g. BIT-CSE-2026-001" required /></Field>
          <Field label="Issue date"><input type="date" value={form.issue_date} onChange={e => change("issue_date", e.target.value)} required /></Field>
          <Field label="Certificate PDF (max 10 MB)"><input id="pdf_file" type="file" accept="application/pdf,.pdf" onChange={e => setPdf(e.target.files?.[0] || null)} required /></Field>
        </div>
        <button className="button" disabled={loading}>{loading ? "Creating..." : "Generate hash & issue certificate"}</button>
      </form>
    </div>
  );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
