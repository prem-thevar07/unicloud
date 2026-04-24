import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getFiles } from "../services/fileService";

import API from "../config/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [connectedClouds, setConnectedClouds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storage, setStorage] = useState(null);
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
     FETCH CONNECTED CLOUDS
  =============================== */
  useEffect(() => {
    if (!token) return;

    API.get("/clouds/connected")
      .then((res) => {
        setConnectedClouds(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  /* ===============================
     FETCH GOOGLE STORAGE
  =============================== */
  useEffect(() => {
    if (!token) return;

    API.get("/google/storage")
      .then((res) => {
        setStorage(res.data?.connected ? res.data : null);
      })
      .catch(() => setStorage(null));
  }, [token]);

  /* ===============================
     🔥 FETCH & NORMALIZE FILES (FIXED)
  =============================== */
  useEffect(() => {
    if (!token) return;

    const loadFiles = async () => {
      try {
        const data = await getFiles("unified");

        // ✅ SAFE FLATTENING
        const allFiles = flattenFiles(data);

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
    <>
      <Header />

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
            <button className="btn-secondary">Open Photos</button>
          </div>
        </section>

        {/* GRID */}
        <section className="dashboard-grid">
          {/* STORAGE */}
          <div className="card glass">
            <div className="card-header">
              <h3>Storage Summary</h3>
            </div>

            <div className="storage-row">
              <span>Google Drive</span>

              {storage ? (
                <>
                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(storage.usedGB / storage.totalGB) * 100}%`,
                      }}
                    />
                  </div>
                  <small>
                    {storage.usedGB} GB / {storage.totalGB} GB
                  </small>
                </>
              ) : (
                <small className="muted">Not connected</small>
              )}
            </div>
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
                <div className="account-row">
                  <span>Google Drive</span>

                  {connectedClouds.includes("google") ? (
                    <span className="status connected">Connected</span>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={handleGoogleConnect}
                    >
                      Connect
                    </button>
                  )}
                </div>

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
                    <p className="file-name">{file.name}</p>
                    <small>{file.provider}</small>

                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="file-link"
                      >
                        Open
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
              {connectedClouds.includes("google") && (
                <li>Google Drive connected</li>
              )}
              <li className="muted">More activity coming</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Dashboard;

/* ===============================
   🔥 HELPER FUNCTION (IMPORTANT)
=============================== */

const flattenFiles = (data) => {
  if (!data) return [];

  return [
    ...(data.image || []),
    ...(data.video || []),
    ...(data.document || []),
    ...(data.other || []),
  ];
};