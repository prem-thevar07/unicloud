import { useEffect, useState } from "react";
import { getFiles } from "../services/fileService";
import "../styles/files.css";

const providerIcons = {
  google: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
};

const Files = () => {
  const [files, setFiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [provider, setProvider] = useState("all");
  const [account, setAccount] = useState("all");

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [files, provider, account]);

  const fetchFiles = async () => {
    try {
      const res = await getFiles({ view: "unified" });

      // 🔥 flatten data
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

    if (provider !== "all") {
      data = data.filter((f) => f.provider === provider);
    }

    if (account !== "all") {
      data = data.filter((f) => f.accountId === account);
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
        <div className="table">
          <div className="table-header">
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
              <span>{file.name}</span>

              <span className="source">
                <img
                  src={providerIcons[file.provider]}
                  alt="provider"
                />
                {file.provider}
              </span>

              <span>
                {file.createdAt
                  ? new Date(file.createdAt).toLocaleString()
                  : "-"}
              </span>

              <span>{file.size || "-"}</span>

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
              <div className="file-icon">📄</div>
            </div>

            <h3>{selectedFile.name}</h3>

            <p>Provider: {selectedFile.provider}</p>
            <p>Size: {selectedFile.size || "-"}</p>

            <a
              href={selectedFile.url}
              target="_blank"
              rel="noreferrer"
              className="open-btn"
            >
              Open File
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