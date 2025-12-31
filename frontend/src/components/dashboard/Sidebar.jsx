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
      <h1 className="logo">Unicloud</h1>

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
