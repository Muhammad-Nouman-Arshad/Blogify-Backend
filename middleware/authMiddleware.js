const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔐 Token check
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];

    // 🔓 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ USER INFO FROM JWT (SOURCE OF TRUTH)
    req.user = {
      id: decoded.id,
      role: decoded.role, // 🔥 admin / user
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = authMiddleware;
