import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./navbar.css";

const Navbar = ({ user, setUser, unreadSenders = 0 }) => {
    const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <nav className="navbar">
     <div className="nav-left">
        <Link to="/" className="nav-logo">ChatApp</Link>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/chat" className="nav-link">
      Chat
      {unreadSenders > 0 && <span className="badge">{unreadSenders}</span>}
    </Link>
        {user?.isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
      </div>
      <div className="nav-right">
        <span className="nav-user">Hello, {user?.username}</span>
        {user && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
