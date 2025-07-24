const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('./auth-middleware');

router.get('/all', auth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
  res.json(users);
});

router.delete('/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Not authorized");
  await User.findByIdAndDelete(req.params.id);
  res.send("User deleted");
});

module.exports = router;
