import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { Verification } from "../types";

export default function VerifyCertificate() {
  const { certificateId = "" } = useParams();
  const [result, setResult] = useState<Verification | null>(null);
  const [error, setError] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [fileResult, setFileResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api.get(`/certificates/${certificateId}/verify/`)
      .then(response => setResult(response.data))
      .catch(() => setError("Certificate not found or verification service is unavailable."));
  }, [certificateId]);

  async function verifyFile(event: FormEvent) {
    event.preventDefault();
    if (!pdf) return;
    const data = new FormData();
    data.append("pdf_file", pdf);
    setChecking(true);
    setFileResult(null);
    try {
      const response = await api.post(`/certificates/${certificateId}/verify-file/`, data);
      setFileResult(response.data);
    } catch {
      setFileResult({status: "Could not verify this file."});
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="verify-wrap">
      <p className="eyebrow">PUBLIC VERIFICATION</p>
      <h1>Certificate verification</h1>
      <p className="muted">Certificate ID: <strong>{certificateId}</strong></p>
      {error && <div className="alert error">{error}</div>}
      {result && <section className="panel verify-card">
        <div className={`result-banner ${result.status === "GENUINE" ? "result-good" : "result-bad"}`}>
          <strong>{result.status === "GENUINE" ? "✓ GENUINE CERTIFICATE" : `⚠ ${result.status}`}</strong>
          <span>{result.ledger_message}</span>
        </div>
        <div className="details-grid">
          <Detail label="Student name" value={result.student_name} />
          <Detail label="USN" value={result.usn} />
          <Detail label="Course" value={result.course} />
          <Detail label="Issue date" value={result.issue_date} />
          <Detail label="Ledger block" value={`#${result.block_index}`} />
          <Detail label="Ledger integrity" value={result.ledger_valid ? "Valid" : "Invalid"} />
          <Detail label="Database matches ledger" value={result.database_matches_ledger ? "Yes" : "No"} />
          <Detail label="Certificate status" value={result.is_revoked ? "Revoked" : "Not revoked"} />
        </div>
        <p className="muted">Registered SHA-256 hash</p>
        <code className="hash">{result.registered_hash}</code>
      </section>}
      {result && <section className="panel form-panel">
        <h2>Verify an uploaded PDF</h2>
        <p className="muted">Upload the certificate PDF you received. The system compares its SHA-256 hash with the registered hash.</p>
        <form onSubmit={verifyFile} className="verify-file-form">
          <input type="file" accept="application/pdf,.pdf" onChange={e => setPdf(e.target.files?.[0] || null)} required />
          <button className="button" disabled={checking}>{checking ? "Checking..." : "Check PDF integrity"}</button>
        </form>
        {fileResult && <div className={`alert ${fileResult.file_matches ? "success" : "error"}`}>
          <strong>{fileResult.status}</strong>
          {fileResult.submitted_hash && <p className="hash">{fileResult.submitted_hash}</p>}
        </div>}
      </section>}
      <p className="back-link"><Link to="/login">Admin login</Link></p>
    </div>
  );
}

function Detail({label, value}: {label: string; value: string}) {
  return <div className="detail"><span>{label}</span><strong>{value}</strong></div>;
}
