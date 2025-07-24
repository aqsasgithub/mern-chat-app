import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/chat.css";
import Navbar from "../components/Navbar";

const Chat = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (user) {
      axios
        .get("http://localhost:5000/api/users/all", {
          withCredentials: true,
        })
        .then((res) => setUsers(res.data.filter((u) => u._id !== user._id)))
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      axios
        .get(`http://localhost:5000/api/messages/${selectedUser._id}`, {
          withCredentials: true,
        })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching messages:", err));
    }
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
        setMessages((prev) => [...prev, res.data]);
        setNewMsg("");
      })
      .catch((err) => console.error("Error sending message:", err));
  };

  return (
    <div>
      {/* <Navbar user={user} setUser={setUser} /> */}
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
            </div>
          ))}
        </div>
        <div className="chat-box">
          {selectedUser ? (
            <>
              <h3>Chat with {selectedUser.username}</h3>
              <div className="messages">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`msg ${msg.sender === user._id ? "sent" : "received"}`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="msg-input">
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
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
