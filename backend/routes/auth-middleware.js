const jwt = require("jsonwebtoken");
const User = require("../models/user"); // ⬅ Make sure this is imported

const JWT_SECRET = process.env.JWT_SECRET || "AqsaSuperChatSecret123!";

const auth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Fetch full user from DB
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user; // ✅ set full user object
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;
