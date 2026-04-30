import { FaCloud, FaImage, FaFolder, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  return (
    <aside className="sidebar glass-card">
      <div className="logo" style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
        <img src="/assets/logo.png" alt="Unicloud Logo" style={{ height: "32px", objectFit: "contain" }} />
      </div>

      <nav>
        <button><FaCloud /> Dashboard</button>
        <button><FaFolder /> Files</button>
        <button><FaImage /> Photos</button>
      </nav>

      <button className="logout-btn" onClick={logout}>
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
