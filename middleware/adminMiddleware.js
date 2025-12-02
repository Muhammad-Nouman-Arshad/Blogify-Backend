// middleware/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
  try {
    // Must be logged in
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Must be admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminMiddleware;
