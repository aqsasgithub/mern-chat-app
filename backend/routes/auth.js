const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Load secret from environment or fallback
const JWT_SECRET = process.env.JWT_SECRET || "AqsaSuperChatSecret123!";

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    res.status(201).json({ message: "Registration successful" });
    
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // set to true in production (HTTPS)
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token").send("Logged out");
});

module.exports = router;
