// routes/adminRoutes.js

const express = require("express");
const router = express.Router();

const admin = require("../middleware/adminMiddleware");
const auth = require("../middleware/authMiddleware");

const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcryptjs");

// For analytics
const { subMonths, format } = require("date-fns");


// =====================================================
// 🔐 CREATE ADMIN — SECURED USING SECRET KEY
// =====================================================
router.post("/create-admin", async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;

    if (!name || !email || !password || !secret) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid admin secret key" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      },
    });

  } catch (err) {
    console.error("Admin creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =====================================================
// 📊 ADMIN DASHBOARD STATS
// GET /api/admin/stats
// =====================================================
router.get("/stats", auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();

    const latestPosts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: totalUsers,
      posts: totalPosts,
      latestPosts,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =====================================================
// 📈 ADVANCED ANALYTICS (LAST 12 MONTHS)
// GET /api/admin/analytics
// =====================================================
router.get("/analytics", auth, admin, async (req, res) => {
  try {
    const months = [];
    const now = new Date();

    // Generate last 12 months: "2024-12", "2025-01", etc.
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(now, i);
      months.push(format(d, "yyyy-MM"));
    }

    // Aggregate posts per month
    const postsAgg = await Post.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregate users per month
    const usersAgg = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation results → { "2024-12": 10, "2025-01": 4 }
    const toMap = (agg) => {
      const map = {};
      agg.forEach((item) => {
        const monthStr = `${item._id.year.toString().padStart(4, "0")}-${String(
          item._id.month
        ).padStart(2, "0")}`;
        map[monthStr] = item.count;
      });
      return map;
    };

    const postsMap = toMap(postsAgg);
    const usersMap = toMap(usersAgg);

    // Build final aligned arrays
    const posts = months.map((m) => postsMap[m] || 0);
    const users = months.map((m) => usersMap[m] || 0);

    res.json({
      months,
      posts,
      users,
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
