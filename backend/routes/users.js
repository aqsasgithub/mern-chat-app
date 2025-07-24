const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('./auth-middleware'); // ✅ Using cookie-based auth

// ✅ Get all users
router.get('/all', auth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
  res.json(users);
});

// ✅ Get pending requests for the logged-in user
router.get('/requests', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.pendingRequests || []);
});

// ✅ Send connection request
router.post('/request/:id', auth, async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).send("User not found");
  if (targetUser.pendingRequests.includes(req.user.id)) return res.status(400).send("Already requested");

  targetUser.pendingRequests.push(req.user.id);
  await targetUser.save();
  res.send("Request sent");
});

// ✅ Accept request
router.post('/accept/:id', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const requesterId = req.params.id;

  if (!user.pendingRequests.includes(requesterId)) return res.status(400).send("No request from this user");

  user.connections.push(requesterId);
  user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);

  const requester = await User.findById(requesterId);
  requester.connections.push(req.user.id);

  await user.save();
  await requester.save();
  res.send("Connection accepted");
});

// ✅ Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Not authorized");
  await User.findByIdAndDelete(req.params.id);
  res.send("User deleted");
});

module.exports = router;
