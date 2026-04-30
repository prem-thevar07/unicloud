import { useEffect, useState, useRef } from "react";
import { getFiles } from "../services/fileService";
import api from "../config/api";
import "../styles/files.css";
import MainLayout from "../layouts/MainLayout";

/* ===============================
   CONSTANTS & HELPERS
=============================== */
const providerIcons = {
  google: "/assets/drive.png",
  onedrive: "/assets/onedrive.png",
  dropbox: "/assets/dropbox.png",
};

const CATEGORIES = [
  { id: "all", label: "All Files", icon: "📁" },
  { id: "image", label: "Images", icon: "🖼️" },
  { id: "video", label: "Video", icon: "🎬" },
  { id: "audio", label: "Music", icon: "🎵" },
  { id: "document", label: "Document", icon: "📄" },
];

const DOC_SUBCATEGORIES = [
  { id: "all", label: "All Documents" },
  { id: "pdf", label: "PDFs", icon: "📕" },
  { id: "word", label: "Word Docs", icon: "📝" },
  { id: "excel", label: "Excel Sheets", icon: "📊" },
  { id: "text", label: "Text Files", icon: "📄" },
];

const getFileCategory = (file) => {
  const mime = file.mimeType?.toLowerCase() || "";
  const name = file.name?.toLowerCase() || "";
  
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime.includes("pdf") ||
    mime.includes("document") ||
    name.endsWith(".pdf") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    name.endsWith(".txt") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx") ||
    name.endsWith(".csv")
  ) return "document";

  return "other";
};

const formatSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

const getPercent = (used = 0, total = 1) => {
  if (!total) return 0;
  return Math.min((used / total) * 100, 100);
};

/* ===============================
   SKELETON COMPONENT
=============================== */
const SkeletonRow = () => (
  <tr className="skeleton-row">
    <td>
      <div className="file-name-cell">
        <div className="skeleton-icon"></div>
        <div className="skeleton-text long"></div>
      </div>
    </td>
    <td><div className="skeleton-text"></div></td>
    <td><div className="skeleton-text"></div></td>
    <td><div className="skeleton-text short"></div></td>
    <td><div className="skeleton-btn"></div></td>
  </tr>
);

/* ===============================
   MAIN COMPONENT
=============================== */
const Files = () => {
  const [files, setFiles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubCategory, setActiveSubCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(15);
  const [loading, setLoading] = useState(true);
  const [loadingMoreCloud, setLoadingMoreCloud] = useState(false);
  const [pageTokens, setPageTokens] = useState({});
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters(false); // Don't reset pagination when just appending files
  }, [files]);

  useEffect(() => {
    applyFilters(true); // Reset pagination when filters change
  }, [activeCategory, activeSubCategory, search, selectedAccount]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch files and accounts in parallel
      const [filesRes, accountsRes] = await Promise.all([
        getFiles({ view: "unified", mode: "all" }), // Fetch everything
        api.get("/accounts").catch(() => ({ data: [] }))
      ]);

      const allFiles = [
        ...(filesRes.data?.image || []),
        ...(filesRes.data?.video || []),
        ...(filesRes.data?.document || []),
        ...(filesRes.data?.other || []),
      ];

      setFiles(allFiles);
      setPageTokens(filesRes.nextPageTokens || {});
      setAccounts(accountsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreFromCloud = async () => {
    if (isFetchingRef.current) return;
    
    // Check if there are any valid page tokens left
    const hasMoreInCloud = Object.values(pageTokens).some(token => token !== "EOF");
    if (!hasMoreInCloud) return;

    isFetchingRef.current = true;
    setLoadingMoreCloud(true);
    try {
      const filesRes = await getFiles({ 
        view: "unified", 
        mode: "all", // Fetch everything
        pageTokens 
      });

      const newFiles = [
        ...(filesRes.data?.image || []),
        ...(filesRes.data?.video || []),
        ...(filesRes.data?.document || []),
        ...(filesRes.data?.other || []),
      ];

      setFiles(prev => [...prev, ...newFiles]);
      setPageTokens(filesRes.nextPageTokens || {});
      setVisibleCount(prev => prev + 15);
    } catch (err) {
      console.error("Fetch more failed:", err);
    } finally {
      isFetchingRef.current = false;
      setLoadingMoreCloud(false);
    }
  };

  const applyFilters = (resetPagination = true) => {
    let data = [...files];

    // Filter by search
    if (search) {
      data = data.filter((f) =>
        f.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== "all") {
      data = data.filter((f) => getFileCategory(f) === activeCategory);

      // If document, check subcategory
      if (activeCategory === "document" && activeSubCategory !== "all") {
        data = data.filter((f) => {
          const name = f.name?.toLowerCase() || "";
          const mime = f.mimeType?.toLowerCase() || "";
          if (activeSubCategory === "pdf") return name.endsWith(".pdf") || mime.includes("pdf");
          if (activeSubCategory === "word") return name.endsWith(".doc") || name.endsWith(".docx") || mime.includes("word");
          if (activeSubCategory === "excel") return name.endsWith(".xls") || name.endsWith(".xlsx") || mime.includes("excel") || mime.includes("spreadsheet") || name.endsWith(".csv");
          if (activeSubCategory === "text") return name.endsWith(".txt") || mime.includes("text/plain");
          return true;
        });
      }
    }

    // Filter by account
    if (selectedAccount) {
      data = data.filter((f) => 
        String(f.accountId) === String(selectedAccount) || 
        String(f.accountEmail).toLowerCase() === String(selectedAccount).toLowerCase()
      );
    }

    setFilteredFiles(data);
    if (resetPagination) {
      setVisibleCount(15); // Only reset visible count on filter change, not on load more
    }
  };

  const hasMoreInCloud = Object.values(pageTokens).some(token => token !== "EOF");

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Trigger when within 100px of the bottom
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (!loading && !isFetchingRef.current) {
        if (visibleCount < filteredFiles.length) {
          setVisibleCount((prev) => prev + 15);
        } else if (hasMoreInCloud) {
          fetchMoreFromCloud();
        }
      }
    }
  };

  return (
    <MainLayout>
      <div className="file-manager-page">
        
        {/* TOP STORAGE CARDS */}
        <div className="storage-cards-container">
          {accounts.map((acc) => (
            <div 
              key={acc._id} 
              className={`storage-card ${selectedAccount === acc.email ? 'active' : ''}`}
              onClick={() => setSelectedAccount(selectedAccount === acc.email ? null : acc.email)}
            >
              <div className="sc-header">
                <img src={providerIcons[acc.provider] || "☁️"} alt={acc.provider} className="sc-icon" />
                <div className="sc-title">
                  <span>Storage</span>
                  <h4>{acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1)}</h4>
                  <small className="sc-email truncate" title={acc.email}>{acc.email}</small>
                </div>
              </div>
              <div className="sc-footer">
                <span className="sc-size">
                  {formatSize(acc.storage?.used)} / {formatSize(acc.storage?.total)}
                </span>
                <div className="circular-progress" style={{"--progress": `${getPercent(acc.storage?.used, acc.storage?.total)}%`}}></div>
              </div>
            </div>
          ))}
          {accounts.length === 0 && !loading && (
             <div className="no-accounts-msg">No cloud accounts connected.</div>
          )}
        </div>

        <div className="file-manager-layout">
          {/* LEFT SIDEBAR */}
          <aside className="fm-sidebar">
            <div className="sidebar-section">
              <h3>Quick Access</h3>
              <p className="sidebar-subtitle">Filter by file type</p>
            </div>

            <div className="categories-list">
              <div className="cat-header">
                <span>Categories</span>
                <button className="dots-btn">•••</button>
              </div>
              
              {CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <button
                    className={`cat-item ${activeCategory === cat.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setActiveSubCategory("all");
                    }}
                  >
                    <span className={`cat-icon ${cat.id}`}>{cat.icon}</span>
                    <span className="cat-label">{cat.label}</span>
                  </button>

                  {/* Subcategories for Documents */}
                  {cat.id === "document" && activeCategory === "document" && (
                    <div className="sub-categories-list">
                      {DOC_SUBCATEGORIES.map((sub) => (
                        <button
                          key={sub.id}
                          className={`sub-cat-item ${activeSubCategory === sub.id ? "active" : ""}`}
                          onClick={() => setActiveSubCategory(sub.id)}
                        >
                          <span className="sub-cat-icon">{sub.icon}</span>
                          <span className="sub-cat-label">{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="fm-main">
            <div className="fm-header">
              <div>
                <h2>Files</h2>
                <p className="sidebar-subtitle">Manage your integrated files</p>
              </div>
              <div className="fm-actions">
                <input
                  type="text"
                  placeholder="Search files..."
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="fm-table-container" onScroll={handleScroll}>
              {loading ? (
                <table className="fm-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Provider</th>
                      <th>Last Modified</th>
                      <th>File Size</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonRow key={i} />)}
                  </tbody>
                </table>
              ) : filteredFiles.length === 0 ? (
                <div className="empty-state">No files found matching criteria.</div>
              ) : (
                <table className="fm-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Provider</th>
                      <th>Last Modified</th>
                      <th>File Size</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.slice(0, visibleCount).map((file) => {
                      const category = getFileCategory(file);
                      const catConfig = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
                      
                      return (
                        <tr key={file.id}>
                          <td>
                            <div className="file-name-cell">
                              <span className={`file-icon-box ${category}`}>{catConfig.icon}</span>
                              <span className="file-name-text" title={file.name}>{file.name}</span>
                            </div>
                          </td>
                          <td>
                             <div className="provider-cell">
                                <img src={providerIcons[file.provider] || "☁️"} alt={file.provider} className="provider-icon-small" />
                                <span className="provider-email truncate" title={file.accountEmail}>
                                  {file.accountEmail || file.provider}
                                </span>
                             </div>
                          </td>
                          <td className="muted-text">
                            {file.createdAt ? new Date(file.createdAt).toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : "-"}
                          </td>
                          <td className="muted-text">{file.size ? formatSize(file.size) : "-"}</td>
                          <td>
                            <a href={file.url} target="_blank" rel="noreferrer" className="action-btn">
                                Open ↗
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Render skeletons at the bottom when infinitely loading */}
                    {loadingMoreCloud && [1, 2, 3].map((i) => <SkeletonRow key={`loading-${i}`} />)}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default Files;