const express= require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const connectDB = require('./config/db');
const cookieParser = require("cookie-parser");

connectDB();

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true 
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

const server = app.listen(5000, ()=>{
    console.log(`🚀 Server running on port 5000`);
});

const io = require("socket.io")(server,{
    cors: {origin: "http://localhost:5173"}
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-message", (data) => {
    const receiverSocketId = onlineUsers.get(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", data);
    } else {
      socket.emit("user-offline", { to: data.to });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});
