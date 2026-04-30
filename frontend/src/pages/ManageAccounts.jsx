import { useEffect, useState } from "react";
import api from "../config/api";
import "../styles/manageAccounts.css";
import MainLayout from "../layouts/MainLayout";

const providerIcons = {
  google: "/assets/drive.png",
  onedrive: "/assets/onedrive.png",
  dropbox: "/assets/dropbox.png",
};

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [activeProvider, setActiveProvider] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  /* ===============================
     FETCH ACCOUNTS
  =============================== */
  const fetchAccounts = async () => {
    try {
      console.log("📡 Fetching accounts...");
      const res = await api.get("/accounts");

      // ✅ FIX: always array
      setAccounts(res.data || []);
    } catch (err) {
      console.error("❌ Fetch accounts error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     CONNECT GOOGLE
  =============================== */
  const connectGoogle = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
    window.location.href = `${baseUrl}/google/connect?token=${token}`;
  };

  /* ===============================
     DELETE ACCOUNT
  =============================== */
  const deleteAccount = async (id) => {
    if (!confirm("Disconnect this account?")) return;

    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
      setSelected(null);
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  /* ===============================
     SYNC ACCOUNT
  =============================== */
  const triggerSync = async (id) => {
    try {
      console.log("🔄 Sync:", id);

      // ✅ CORRECT ROUTE
      await api.post(`/google/sync/${id}`);

      fetchAccounts();
    } catch (err) {
      console.error("❌ Sync failed:", err);
    }
  };

  /* ===============================
     FILTER
  =============================== */
  const providers = [...new Set(accounts.map(a => a.provider))];

  const visibleAccounts =
    activeProvider === "all"
      ? accounts
      : accounts.filter(a => a.provider === activeProvider);

  return (
    <MainLayout>
      <div className="accounts-page">

        {/* HEADER */}
        <div className="topbar">
          <div>
            <h2>Manage Cloud Accounts</h2>
            <p>Connect and manage multiple providers</p>
          </div>

          <button className="add-btn" onClick={connectGoogle}>
            ➕ Add Google Account
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="tabs">
          <button
            className={activeProvider === "all" ? "active" : ""}
            onClick={() => setActiveProvider("all")}
          >
            All
          </button>

          {providers.map((p) => (
            <button
              key={p}
              className={activeProvider === p ? "active" : ""}
              onClick={() => setActiveProvider(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="content">

          {/* LEFT */}
          <div className="accounts-grid">

            {loading && <p>Loading...</p>}

            {!loading && visibleAccounts.map((acc) => (
              <div
                key={acc._id}
                className={`account-card ${selected?._id === acc._id ? "selected" : ""
                  }`}
                onClick={() => setSelected(acc)}
              >
                {/* HEADER */}
                <div className="card-top">
                  <img
                    src={providerIcons[acc.provider]} // ✅ FIXED
                    alt={acc.provider}
                  />
                  <span className={`status ${acc.status}`}>
                    {acc.status || "connected"}
                  </span>
                </div>

                {/* EMAIL */}
                <h4 title={acc.email}>
                  {acc.email || "Unknown account"}
                </h4>

                {/* STORAGE */}
                <div className="storage">
                  <div className="bar">
                    <div
                      className="fill"
                      style={{
                        width: `${getPercent(
                          acc.storage?.used,
                          acc.storage?.total
                        )}%`,
                      }}
                    />
                  </div>

                  <small>
                    {formatSize(acc.storage?.used)} /{" "}
                    {formatSize(acc.storage?.total)}
                  </small>
                </div>

                {/* LAST SYNC */}
                <small>
                  Last sync:{" "}
                  {acc.lastSyncedAt
                    ? new Date(acc.lastSyncedAt).toLocaleString()
                    : "Never"}
                </small>

                {/* ACTIONS */}
                <div className="actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerSync(acc._id);
                    }}
                  >
                    Sync
                  </button>

                  <button
                    className="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAccount(acc._id);
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>



        </div>
      </div>
    </MainLayout>
  );
};

export default ManageAccounts;

/* ===============================
   UTILS
=============================== */

const getPercent = (used = 0, total = 1) => {
  if (!total) return 0;
  return Math.min((used / total) * 100, 100);
};

const formatSize = (bytes) => {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};