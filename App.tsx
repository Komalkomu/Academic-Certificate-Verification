import { useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddCertificate from "./pages/AddCertificate";
import CertificateList from "./pages/CertificateList";
import VerifyCertificate from "./pages/VerifyCertificate";

function Protected({ children }: { children: JSX.Element }) {
  return localStorage.getItem("access_token") ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setLoggedIn(false);
    navigate("/login");
  }

  return (
    <div className="app-shell">
      {loggedIn && (
        <header className="topbar">
          <Link to="/" className="brand">🎓 CertiVerify</Link>
          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/add">Add Certificate</Link>
            <Link to="/certificates">Certificates</Link>
          </nav>
          <button className="button button-outline" onClick={logout}>Logout</button>
        </header>
      )}
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
          <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/add" element={<Protected><AddCertificate /></Protected>} />
          <Route path="/certificates" element={<Protected><CertificateList /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer>Academic Certificate Verification System · Mini Project</footer>
    </div>
  );
}
