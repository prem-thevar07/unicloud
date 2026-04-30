import { useState, useEffect, useRef, useCallback } from "react";
import API from "../config/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/photos.css";

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [pageTokens, setPageTokens] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [showVideos, setShowVideos] = useState(false);
  
  const observer = useRef();
  
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await API.get("/accounts");
        setAccounts(res.data);
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  // Fetch photos
  const fetchPhotos = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await API.post("/photos", {
        accountId: selectedAccount,
        pageTokens: isLoadMore ? pageTokens : undefined,
        includeVideos: showVideos
      });

      const newPhotos = res.data.files || [];
      const newTokens = res.data.nextTokens || {};

      if (isLoadMore) {
        setPhotos(prev => [...prev, ...newPhotos]);
      } else {
        setPhotos(newPhotos);
      }

      setPageTokens(newTokens);

      // Check if there's any valid token left
      const moreAvailable = Object.values(newTokens).some(token => token !== "EOF");
      setHasMore(moreAvailable);

    } catch (err) {
      console.error("Failed to load photos", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // When account selection or video toggle changes, fetch from scratch
  useEffect(() => {
    fetchPhotos(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, showVideos]);

  const lastPhotoElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPhotos(true);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, pageTokens, selectedAccount]);

  return (
    <MainLayout>
      <div className="photos-page">
        <div className="photos-header">
          <h1>Photos</h1>
          
          <div className="header-controls">
            <label className="video-toggle">
              <span className="toggle-label">Show Videos</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={showVideos} 
                  onChange={(e) => setShowVideos(e.target.checked)} 
                />
                <span className="slider"></span>
              </div>
            </label>

            {accounts.length > 0 && (
              <div className="account-filter">
                <select 
                  value={selectedAccount} 
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.email} ({acc.provider})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="photos-grid">
            {[...Array(12)].map((_, i) => (
              <div key={`skeleton-${i}`} className="skeleton-card" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="empty-state">
            <h3>No media found</h3>
            <p>Upload some images or videos to your cloud to see them here.</p>
          </div>
        ) : (
          <>
            <div className="photos-grid">
              {photos.map((photo, index) => {
                const isLast = index === photos.length - 1;
                const isVideo = photo.mimeType?.includes("video");

                return (
                  <div 
                    ref={isLast ? lastPhotoElementRef : null}
                    key={photo.id + index} 
                    className="photo-card"
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <img 
                      src={photo.thumbnailLink?.replace("=s220", "=s400") || "/assets/logo.png"} 
                      alt={photo.name} 
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "/assets/logo.png";
                        e.target.style.objectFit = "contain";
                        e.target.style.padding = "40px";
                      }}
                    />
                    {isVideo && (
                      <div className="video-indicator">
                        ▶
                      </div>
                    )}
                    <div className="photo-overlay">
                      <span className="photo-name">{photo.name}</span>
                      <span className="photo-date">
                        {new Date(photo.createdTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn" 
                  onClick={() => fetchPhotos(true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightboxPhoto && (
        <div className="lightbox-overlay">
          <div className="lightbox-header">
            <div className="lightbox-header-info">
              <h3>{lightboxPhoto.name}</h3>
              <p>
                {new Date(lightboxPhoto.createdTime).toLocaleString()} • {lightboxPhoto.accountEmail}
              </p>
            </div>
            <div className="lightbox-actions">
              <a 
                href={lightboxPhoto.webViewLink} 
                target="_blank" 
                rel="noreferrer" 
                className="lightbox-btn"
              >
                Open in Drive
              </a>
              <a 
                href={lightboxPhoto.webContentLink} 
                download 
                className="lightbox-btn"
              >
                Download
              </a>
              <button 
                className="lightbox-close" 
                onClick={() => setLightboxPhoto(null)}
              >
                ×
              </button>
            </div>
          </div>
          <div className="lightbox-content" onClick={() => setLightboxPhoto(null)}>
            <img 
              // We use a larger thumbnail instead of full webContentLink for instant load, 
              // but if they want max res, we can try to use webContentLink. 
              // webContentLink initiates a download usually in Drive, so large thumbnail is safer.
              src={lightboxPhoto.thumbnailLink?.replace("=s220", "=s2048") || "/assets/logo.png"} 
              alt={lightboxPhoto.name} 
              className="lightbox-img"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "/assets/logo.png";
                e.target.style.objectFit = "contain";
                e.target.style.opacity = "0.5";
              }}
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Photos;
