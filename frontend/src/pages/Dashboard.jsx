import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getFiles } from "../services/fileService";

import API from "../config/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentFiles, setRecentFiles] = useState([]);

  const token = localStorage.getItem("token");

  /* ===============================
     AUTH PROTECTION
  =============================== */
  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  /* ===============================
     FETCH ACCOUNTS & STORAGE
  =============================== */
  useEffect(() => {
    if (!token) return;

    API.get("/accounts")
      .then((res) => {
        setAccounts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load accounts:", err);
        setAccounts([]);
        setLoading(false);
      });
  }, [token]);

  /* ===============================
     🔥 FETCH & NORMALIZE FILES (FIXED)
  =============================== */
  useEffect(() => {
    if (!token) return;

    const loadFiles = async () => {
      try {
        const response = await getFiles({ view: "unified", mode: "all" });

        // ✅ SAFE FLATTENING
        const allFiles = flattenFiles(response.data);

        // ✅ SORT BY DATE (LATEST FIRST)
        const sorted = allFiles.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // ✅ LIMIT FOR DASHBOARD
        setRecentFiles(sorted.slice(0, 10));
      } catch (err) {
        console.error("Failed to load files:", err);
        setRecentFiles([]);
      }
    };

    loadFiles();
  }, [token]);

  /* ===============================
     GOOGLE CONNECT
  =============================== */
  const handleGoogleConnect = () => {
    const backendBaseUrl =
      import.meta.env.VITE_API_BASE_URL.replace("/api", "");

    window.location.href = `${backendBaseUrl}/api/auth/google`;
  };

  return (
    <MainLayout>
      <main className="dashboard-page">
        {/* HERO */}
        <section className="dashboard-hero glass">
          <div>
            <h1>Dashboard</h1>
            <p>
              Unified control over all your cloud storage — fast, simple, powerful.
            </p>
          </div>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/files")}
            >
              Open Files
            </button>
            <button className="btn-secondary" onClick={() => navigate("/photos")}>Open Photos</button>
          </div>
        </section>

        {/* GRID */}
        <section className="dashboard-grid">
          {/* STORAGE */}
          <div className="card glass">
            <div className="card-header">
              <h3>Storage Summary</h3>
            </div>

            {Array.isArray(accounts) && accounts.length > 0 ? accounts.map((acc) => (
              <div key={`storage-${acc._id}`} className="storage-row">
                <div className="storage-info">
                  <span className="storage-provider">
                    <img src={`/assets/${acc.provider === 'google' ? 'drive' : acc.provider}.png`} alt={acc.provider} className="storage-icon" />
                    {acc.provider ? acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1) : "Unknown"}
                  </span>
                  <small className="storage-email">{acc.email}</small>
                </div>

                {acc.storage ? (
                  <>
                    <div className="progress">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(acc.storage.used / acc.storage.total) * 100}%`,
                        }}
                      />
                    </div>
                    <small>
                      {formatSize(acc.storage.used)} / {formatSize(acc.storage.total)}
                    </small>
                  </>
                ) : (
                  <small className="muted">Calculating...</small>
                )}
              </div>
            )) : (
              <div className="storage-row">
                <small className="muted">No accounts connected</small>
              </div>
            )}
          </div>

          {/* ACCOUNTS */}
          <div className="card glass">
            <div className="card-header">
              <h3>Connected Accounts</h3>
            </div>

            {loading ? (
              <p className="muted">Checking...</p>
            ) : (
              <>
                {Array.isArray(accounts) && accounts.map((acc) => (
                  <div key={`account-${acc._id}`} className="account-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={`/assets/${acc.provider === 'google' ? 'drive' : acc.provider}.png`} alt={acc.provider} style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                      {acc.email}
                    </span>
                    <span className="status connected">Connected</span>
                  </div>
                ))}
                
                {(!accounts || accounts.length === 0) && (
                  <div className="account-row">
                    <span>Google Drive</span>
                    <button
                      className="btn-primary"
                      onClick={handleGoogleConnect}
                    >
                      Connect
                    </button>
                  </div>
                )}

                <div className="account-row disabled">
                  <span>OneDrive</span>
                  <span className="status">Soon</span>
                </div>

                <div className="account-row disabled">
                  <span>Dropbox</span>
                  <span className="status">Soon</span>
                </div>
              </>
            )}
          </div>

          {/* 🔥 RECENT FILES */}
          <div className="card glass span-2">
            <div className="card-header">
              <h3>Recent Files</h3>
              <button
                className="btn-secondary"
                onClick={() => navigate("/files")}
              >
                View All
              </button>
            </div>

            <div className="files-grid">
              {recentFiles.length === 0 ? (
                <p className="muted">No recent files</p>
              ) : (
                recentFiles.map((file) => (
                  <div key={file.id} className="file-card">
                    <p className="file-name" title={file.name}>{file.name}</p>
                    <small className="file-provider">{file.provider}</small>

                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="file-link btn-secondary"
                      >
                        Open ↗
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ACTIVITY */}
          <div className="card glass">
            <div className="card-header">
              <h3>Activity</h3>
            </div>

            <ul className="activity-list">
              {Array.isArray(accounts) && accounts.some(acc => acc.provider === "google") && (
                <li><span className="dot"></span> Google Drive connected</li>
              )}
              <li className="muted"><span className="dot" style={{background: 'transparent', border: '1px solid #9aa3c7'}}></span> More activity coming soon</li>
            </ul>
          </div>
        </section>
      </main>
    </MainLayout>
  );
};

export default Dashboard;

/* ===============================
   🔥 HELPER FUNCTION (IMPORTANT)
=============================== */

function flattenFiles(data) {
  if (!data) return [];

  return [
    ...(data.image || []),
    ...(data.video || []),
    ...(data.document || []),
    ...(data.other || []),
  ];
}

function formatSize(bytes) {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}