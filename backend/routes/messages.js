const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('./auth-middleware');



// router.post('/', auth, async (req, res) => {
//   const { to, content } = req.body;

//   const message = await Message.create({
//     sender: req.user._id,
//     receiver: to,
//     content,
//     read: false
//   });

//   res.json(message);
//   console.log("New message:", {
//     from: req.user._id,
//     to,
//     content,
//   });
  
// });

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

router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    // const userId = mongoose.Types.ObjectId(req.params.userId);


    const counts = await Message.aggregate([
      { $match: { receiver: userId, read: false } },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 }
        }
      }
    ]);

    const countPerSender = {};
    counts.forEach(({ _id, count }) => {
      countPerSender[_id] = count;
    });

    res.json({ countPerSender });
  } catch (err) {
    console.error("Error getting unread counts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get conversation
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

// router.get('/:userId', auth, async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     const messages = await Message.find({
//       $or: [
//         { sender: req.user._id, receiver: userId },
//         { sender: userId, receiver: req.user._id }
//       ]
//     }).sort({ createdAt: 1 });

//     const firstUnread = messages.find(
//       (msg) =>
//         msg.receiver.toString() === req.user._id.toString() &&
//         !msg.read
//     );

//     await Message.updateMany(
//       { sender: userId, receiver: req.user._id, read: false },
//       { $set: { read: true } }
//     );

//     res.json({
//       messages,
//       firstUnreadId: firstUnread ? firstUnread._id : null,
//     });
//   } catch (error) {
//     console.error("🔥 Error in GET /:userId:", error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });




// router.put('/mark-read', auth, async (req, res) => {
//   const { from } = req.body;

//   await Message.updateMany(
//     { sender: from, receiver: req.user._id, read: false },
//     { $set: { read: true } }
//   );

//   res.sendStatus(200);
// });




module.exports = router;
