import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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
      setStorage(null);
      setRecentFiles([]);
      navigate("/auth");
    }
  }, [token, navigate]);

  /* ===============================
     GET USER ID FROM JWT
  =============================== */
  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch {
      navigate("/auth");
    }
  }

  /* ===============================
     FETCH CONNECTED CLOUDS
  =============================== */
  useEffect(() => {
    if (!token) return;

    API.get("/clouds/connected")
      .then((res) => {
        setConnectedClouds(res.data);
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
        if (res.data.connected) {
          setStorage(res.data);
        } else {
          setStorage(null);
        }
      })
      .catch(() => setStorage(null));
  }, [token]);

  /* ===============================
     GOOGLE CONNECT HANDLER (FIXED ✅)
  =============================== */
  const handleGoogleConnect = () => {
    if (!userId) {
      alert("User not logged in");
      return;
    }

    const backendBaseUrl =
      import.meta.env.VITE_API_BASE_URL.replace("/api", "");

    window.location.href = `${backendBaseUrl}/api/google/connect?userId=${userId}`;
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
              All your clouds in one place — overview, storage, and recents.
            </p>
          </div>

          <div className="hero-actions">
            <button className="btn-primary">Open Files</button>
            <button className="btn-secondary">Open Photos</button>
          </div>
        </section>

        {/* GRID */}
        <section className="dashboard-grid">
          {/* STORAGE SUMMARY */}
          <div className="card glass">
            <div className="card-header">
              <h3>Storage Summary</h3>
              <span className="badge">Updated just now</span>
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

            <div className="storage-row disabled">
              <span>OneDrive</span>
              <div className="progress" />
            </div>

            <div className="storage-row disabled">
              <span>Dropbox</span>
              <div className="progress" />
            </div>
          </div>

          {/* CONNECTED ACCOUNTS */}
          <div className="card glass">
            <div className="card-header">
              <h3>Connected Accounts</h3>
            </div>

            {loading ? (
              <p className="muted">Checking connections...</p>
            ) : (
              <>
                <div className="account-row">
                  <span>Google Drive</span>

                  {storage ? (
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
                  <span className="status">Coming soon</span>
                </div>

                <div className="account-row disabled">
                  <span>Dropbox</span>
                  <span className="status">Coming soon</span>
                </div>
              </>
            )}
          </div>

          {/* RECENT FILES */}
          <div className="card glass span-2">
            <div className="card-header">
              <h3>Recent Files</h3>
              <button className="btn-secondary">View all</button>
            </div>

            <table className="files-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Modified</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr className="muted">
                  <td colSpan="5">Recent files integration coming next</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ACTIVITY */}
          <div className="card glass">
            <div className="card-header">
              <h3>Activity</h3>
            </div>

            <ul className="activity-list">
              {connectedClouds.includes("google") && (
                <li>
                  <span className="dot" />
                  Google Drive connected
                </li>
              )}
              <li className="muted">More activity will appear here</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Dashboard;
