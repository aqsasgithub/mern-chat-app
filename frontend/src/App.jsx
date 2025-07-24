import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  return (
    <Router>
      {user && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={user ? <Home user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/chat" element={user ? <Chat user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.isAdmin ? <Admin user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
