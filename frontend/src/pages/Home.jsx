import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import Navbar from "../components/Navbar";

const Home = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/all", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/requests", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching requests", err);
      }
    };

    fetchUsers();
    fetchRequests();
  }, [user]);

  const handleFollow = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/users/request",
        { to: id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Request sent!");
    } catch (err) {
      console.error("Error sending request", err);
    }
  };

  const handleChat = (id) => {
    navigate("/chat", { state: { to: id } });
  };

  return (
    <div className="home-container">
      <h1>Welcome, {user.username}</h1>
      <div className="user-grid">
        {users
          .filter((u) => u._id !== user._id)
          .map((u) => (
            <div key={u._id} className="user-card">
              <p><strong>{u.username}</strong></p>
              <p>{u.email}</p>
              {u.followers?.includes(user._id) || requests.includes(u._id) ? (
                <button className="chat-btn" onClick={() => handleChat(u._id)}>
                  Chat
                </button>
              ) : (
                <button className="follow-btn" onClick={() => handleFollow(u._id)}>
                  Follow
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Home;
