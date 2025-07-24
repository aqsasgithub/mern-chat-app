import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/chat.css";
import Navbar from "../components/Navbar";
import { FaTrash } from "react-icons/fa";


const Chat = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleDeleteChat = () => {
    if (!selectedUser) return;
  
    const confirmDelete = window.confirm(`Are you sure you want to delete chat with ${selectedUser.username}?`);
  
    if (!confirmDelete) return;
  
    axios
      .delete(`http://localhost:5000/api/messages/${selectedUser._id}`, {
        withCredentials: true,
      })
      .then(() => {
        setMessages([]); // clear messages on frontend
      })
      .catch((err) => console.error("Error deleting chat:", err));
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  // Fetch users on mount
  useEffect(() => {
    if (user) {
      axios
        .get("http://localhost:5000/api/users/all", { withCredentials: true })
        .then((res) =>
          setUsers(res.data.filter((u) => u._id !== user._id))
        )
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get("http://localhost:5000/api/messages/unread-count", {
          withCredentials: true,
        })
        .then((res) => setUnreadCounts(res.data));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = () => {
      axios
        .get(`http://localhost:5000/api/messages/${selectedUser._id}`, {
          withCredentials: true,
        })
        .then((res) => {
          setMessages(res.data);
          axios.put(
            "http://localhost:5000/api/messages/mark-read",
            { from: selectedUser._id },
            { withCredentials: true }
          );
        })
        .catch((err) => console.error("Polling error:", err));
    };

    fetchMessages(); 
    const interval = setInterval(fetchMessages, 1000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    axios
      .post(
        "http://localhost:5000/api/messages",
        {
          to: selectedUser._id,
          content: newMsg,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setNewMsg("");
        axios
          .get(`http://localhost:5000/api/messages/${selectedUser._id}`, {
            withCredentials: true,
          })
          .then((res) => setMessages(res.data))
          .catch((err) => console.error("Error fetching messages after send:", err));
      })
      .catch((err) => console.error("Error sending message:", err));
  };
  
  return (
    <div>
      <div className="chat-wrapper">
        <div className="users-list">
          <h3>Users</h3>
          {users.map((u) => (
  <div
    key={u._id}
    onClick={() => setSelectedUser(u)}
    className={`user-item ${selectedUser?._id === u._id ? "active" : ""}`}
  >
    {u.username}
    {unreadCounts[u._id] > 0 && (
      <span className="unread-badge">{unreadCounts[u._id]}</span>
    )}
  </div>
))}

        </div>
        <div className="chat-box">
          {selectedUser ? (
            <>
              <h3>Chat with {selectedUser.username}</h3>
              <div className="chat-header"> <button 
    onClick={handleDeleteChat}
  >    <FaTrash />
  </button></div>
             
              <div className="messages">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`msg ${msg.sender === user._id ? "sent" : "received"}`}
                  >
                    {msg.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="msg-input">
              <input
  value={newMsg}
  onChange={(e) => setNewMsg(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  }}
  placeholder="Type a message..."
/>
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <p>Select a user to chat</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
