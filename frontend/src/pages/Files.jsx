import { useEffect, useState } from "react";
import { getFiles } from "../services/fileService";
import "../styles/files.css";

const Files = () => {
  const [view, setView] = useState("unified");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getFiles({ view, type, search, page });
        setData(res || {});
      } catch (err) {
        console.error(err);
        setData({});
      }
      setLoading(false);
    };

    fetchData();
  }, [view, type, search, page]);

  return (
    <div className="files-page">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>📂 Files</h2>

        <div className="sidebar-section">
          <h4>Categories</h4>
          <button onClick={() => setType("")}>All</button>
          <button onClick={() => setType("image")}>Images</button>
          <button onClick={() => setType("video")}>Videos</button>
          <button onClick={() => setType("document")}>Documents</button>
        </div>

        <div className="sidebar-section">
          <h4>View</h4>
          <button onClick={() => setView("unified")}>Unified</button>
          <button onClick={() => setView("accounts")}>Accounts</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="files-main">
        {/* TOPBAR */}
        <div className="topbar">
          <input
            type="text"
            placeholder="🔍 Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className="loading">Loading files...</p>}

        {!loading && data && (
          <>
            {view === "unified" && renderUnified(data, setSelectedFile)}
            {view === "accounts" && renderAccounts(data, setSelectedFile)}

            {/* LOAD MORE */}
            <div className="load-more">
              <button onClick={() => setPage((p) => p + 1)}>
                Load More
              </button>
            </div>
          </>
        )}
      </main>

      {selectedFile && (
        <div className="preview-overlay" onClick={() => setSelectedFile(null)}>
          <div className="preview-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedFile(null)}>
              ✖
            </button>

            <h3>{selectedFile.name}</h3>

            {/* IMAGE */}
            {selectedFile.type === "image" && (
  <iframe
    src={selectedFile.previewUrl}
    width="500"
    height="400"
  />
)}

            {/* VIDEO */}
            {selectedFile.type === "video" && (
              <iframe
                src={selectedFile.url}
                width="600"
                height="400"
                allow="autoplay"
              />
            )}

            {/* DOCUMENT */}
            {selectedFile.type === "document" && (
              <iframe
                src={selectedFile.url}
                width="600"
                height="500"
              />
            )}

            {/* FALLBACK */}
            {selectedFile.type === "other" && (
              <p>No preview available</p>
            )}

            {/* OPEN BUTTON */}
            <a
              href={selectedFile.url}
              target="_blank"
              rel="noreferrer"
              className="open-btn-large"
            >
              Open in new tab ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;

/* ===============================
   RENDERERS
=============================== */

const renderUnified = (data, setSelectedFile) => {
  return Object.keys(data).map((type) => (
    <section key={type}>
      <h2 className="section-title">{type}</h2>

      <div className="grid">
        {data[type].map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onClick={() => setSelectedFile(file)}
          />
        ))}
      </div>
    </section>
  ));
};

const renderAccounts = (data, setSelectedFile) => {
  return Object.keys(data).map((provider) => (
    <section key={provider}>
      <h2 className="section-title">{provider}</h2>

      {Object.keys(data[provider]).map((accountId) => (
        <div key={accountId}>
          <h4 className="account-title">Account: {accountId}</h4>

          <div className="grid">
            {data[provider][accountId].map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onClick={() => setSelectedFile(file)}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  ));
};

/* ===============================
   FILE CARD
=============================== */

const FileCard = ({ file, onClick }) => {
  return (
    <div className="file-card">
      {/* CLICKABLE AREA */}
      <div onClick={onClick}>
        {file.type === "image" ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150?text=No+Preview";
            }}
          />
        ) : (
          <div className="file-icon">
            {file.type === "video" && "🎥"}
            {file.type === "document" && "📄"}
            {file.type === "other" && "📁"}
          </div>
        )}

        <p className="file-name">{file.name}</p>
        <small>{file.provider}</small>
      </div>

      {/* OPEN BUTTON */}
      <a
        href={file.url}
        target="_blank"
        rel="noreferrer"
        className="open-btn"
      >
        Open ↗
      </a>
    </div>
  );
};