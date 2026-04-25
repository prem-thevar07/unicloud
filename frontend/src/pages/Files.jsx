import { useEffect, useState } from "react";
import { getFiles } from "../services/fileService";
import "../styles/files.css";

/* ===============================
   PROVIDER ICONS
=============================== */
const providerIcons = {
  google: "/assets/google.png",
};

/* ===============================
   FILE TYPE ICONS
=============================== */
const getFileIcon = (file) => {
  const name = file.name?.toLowerCase() || "";

  if (name.endsWith(".pdf")) return "📕";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "📄";
  if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "📊";
  if (name.endsWith(".zip") || name.endsWith(".rar")) return "🗜";
  if (file.type === "image") return "🖼";
  if (file.type === "video") return "🎬";

  return "📁";
};

/* ===============================
   MAIN COMPONENT
=============================== */
const Files = () => {
  const [files, setFiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [files, search]);

  const fetchFiles = async () => {
    try {
      const res = await getFiles({
        view: "unified",
        mode: "files",
      });

      const all = [
        ...(res.document || []),
        ...(res.other || []),
      ];

      setFiles(all);
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = () => {
    let data = [...files];

    if (search) {
      data = data.filter((f) =>
        f.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  };

  return (
    <div className="files-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>Unicloud</h2>

        <div className="menu">
          <button className="active">📁 Files</button>
          <button>🖼 Photos</button>
        </div>

        <h4>Cloud Accounts</h4>

        <div className="provider">
          <img src={providerIcons.google} alt="google" />
          <span>Google Drive</span>
        </div>

        <div className="account">
          <span>prem@gmail.com</span>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* 🔥 SEARCH BAR */}
        <div className="topbar">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="table">
          <div className="table-header">
            <span>Icon</span>
            <span>Name</span>
            <span>Source</span>
            <span>Modified</span>
            <span>Size</span>
            <span>Open</span>
          </div>

          {filtered.map((file) => (
            <div
              key={file.id}
              className={`row ${
                selectedFile?.id === file.id ? "active" : ""
              }`}
              onClick={() => setSelectedFile(file)}
            >
              {/* ICON */}
              <span className="file-icon">
                {getFileIcon(file)}
              </span>

              {/* NAME */}
              <span className="file-name" title={file.name}>
                {file.name}
              </span>

              {/* SOURCE */}
              <span className="source">
                <img
                  src={providerIcons[file.provider]}
                  alt="provider"
                />
                {file.provider}
              </span>

              {/* DATE */}
              <span>
                {file.createdAt
                  ? new Date(file.createdAt).toLocaleString()
                  : "-"}
              </span>

              {/* SIZE */}
              <span>{file.size || "-"}</span>

              {/* OPEN */}
              <span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open ↗
                </a>
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* DETAILS PANEL */}
      <aside className="details">
        {selectedFile ? (
          <>
            <div className="preview">
              <div className="file-icon large">
                {getFileIcon(selectedFile)}
              </div>
            </div>

            <h3 className="truncate">{selectedFile.name}</h3>

            <p><b>Provider:</b> {selectedFile.provider}</p>
            <p><b>Size:</b> {selectedFile.size || "-"}</p>

            <a
              href={selectedFile.url}
              target="_blank"
              rel="noreferrer"
              className="open-btn"
            >
              Open File ↗
            </a>
          </>
        ) : (
          <p>Select a file</p>
        )}
      </aside>
    </div>
  );
};

export default Files;