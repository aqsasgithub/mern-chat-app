const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('./auth-middleware');

router.post("/", auth, async (req, res) => {
  try {
    console.log("Sending message from:", req.user); // 🟢 log this

    const { to, content } = req.body;

    if (!to || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = new Message({
      sender: req.user._id,
      receiver: to,
      content,
    });

    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    console.error("🔥 Backend error while sending message:", err); // 👈 This will show real problem
    res.status(500).json({ error: "Internal server error" });
  }
});
// GET unread count per sender
router.get('/unread-count', auth, async (req, res) => {
  try {
    const counts = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          read: false,
          sender: { $ne: null }, // ✅ Filter out missing/null sender
        }
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = {};
    counts.forEach(({ _id, count }) => {
      if (_id) unreadMap[_id.toString()] = count;
    });

    res.json(unreadMap);
  } catch (err) {
    console.error("🔥 Error in /unread-count:", err);
    res.status(500).json({ error: "Failed to get unread counts" });
  }
});


router.put('/mark-read', auth, async (req, res) => {
  const { from } = req.body;

  try {
    await Message.updateMany(
      { sender: from, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

router.delete('/:userId', auth, async (req, res) => {
  const userId = req.params.userId;

  try {
    await Message.deleteMany({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    });

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ message: "Failed to delete chat" });
  }
});

router.get('/:userId', auth, async (req, res) => {
  const userId = req.params.userId;
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: userId },
      { sender: userId, receiver: req.user.id }
    ]
  }).sort({ timestamp: 1 });

  res.json(messages);
  console.log("req.user._id:", req.user._id);
console.log("req.params.userId:", req.params.userId);

});



module.exports = router;
