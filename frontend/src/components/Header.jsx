import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../styles/header.css";
import { SITE_NAME } from "../config/siteConfig";

const Header = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  // 🔥 SYNC USER (storage + custom event)
  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    syncUser();

    // cross-tab
    window.addEventListener("storage", syncUser);
    // same-tab
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/")}>
        {SITE_NAME}
      </div>

      <nav className="nav">
        <a href="/#features">Tools</a>
        {/* <a href="/#about">About</a> */}
        <Link to="/about">About</Link>


        {!user ? (
          <Link to="/auth" className="btn-primary2">
            Login / Signup
          </Link>
        ) : (
          <div className="profile-wrap" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={() => setOpen((p) => !p)}
            >
              <span className="avatarheader">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="username">{displayName}</span>
            </button>

            {open && (
              <div className="profile-dropdown">
                <div className="dropdown-user">
                  <span className="dropdown-avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{displayName}</strong>
                    {displayEmail && (
                      <p className="muted">{displayEmail}</p>
                    )}
                  </div>
                </div>

                <hr />

                <button onClick={() => navigate("/profile")}>
                  Manage Profile
                </button>

                <button onClick={() => navigate("/dashboard")}>
                  Dashboard
                </button>

                <hr />

                <button className="danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
