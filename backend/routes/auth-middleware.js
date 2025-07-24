const jwt = require("jsonwebtoken" );

const JWT_SECRET = process.env.JWT_SECRET || "AqsaSuperChatSecret123!";

const auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Access denied. No token provided."});

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });

};
};

module.exports = auth;

