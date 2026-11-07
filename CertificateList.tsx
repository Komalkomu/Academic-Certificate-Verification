import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Certificate } from "../types";

export default function CertificateList() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function load(query = "") {
    try {
      const response = await api.get("/certificates/", {params: query ? {search: query} : {}});
      setItems(response.data);
      setError("");
    } catch {
      setError("Could not load certificates.");
    }
  }

  useEffect(() => { load(); }, []);

  async function revoke(id: string) {
    if (!window.confirm(`Revoke certificate ${id}?`)) return;
    try {
      await api.post(`/certificates/${id}/revoke/`);
      load(search);
    } catch {
      setError("Could not revoke certificate.");
    }
  }

  return (
    <div>
      <div className="page-heading"><div><p className="eyebrow">RECORDS</p><h1>Certificates</h1><p className="muted">Search and manage issued certificates.</p></div><Link className="button" to="/add">＋ Add new</Link></div>
      <div className="search-row"><input placeholder="Search by student name, USN or certificate ID..." value={search} onChange={e => setSearch(e.target.value)} /><button className="button" onClick={() => load(search)}>Search</button></div>
      {error && <div className="alert error">{error}</div>}
      <div className="panel table-wrap">
        <table><thead><tr><th>Student</th><th>Certificate ID</th><th>Issue date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{items.map(item => <tr key={item.id}>
            <td><strong>{item.student_name}</strong><small>{item.usn}</small></td>
            <td>{item.certificate_id}</td><td>{item.issue_date}</td>
            <td><span className={`status-pill ${item.is_revoked ? "bad" : "good"}`}>{item.is_revoked ? "Revoked" : "Active"}</span></td>
            <td className="actions"><Link to={`/verify/${item.certificate_id}`}>Verify</Link><a href={item.pdf_url} target="_blank" rel="noreferrer">PDF</a>{item.qr_url && <a href={item.qr_url} target="_blank" rel="noreferrer">QR</a>}{!item.is_revoked && <button className="text-button danger-text" onClick={() => revoke(item.certificate_id)}>Revoke</button>}</td>
          </tr>)}</tbody>
        </table>
        {items.length === 0 && <p className="empty">No certificates found.</p>}
      </div>
    </div>
  );
}
