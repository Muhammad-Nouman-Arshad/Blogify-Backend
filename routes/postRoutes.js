const express = require("express");
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  reactToPost,          // 🔥 NEW
  toggleApprovePost,
  searchPosts,
} = require("../controllers/postController");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ===========================
// 🔍 SEARCH ROUTE (ALWAYS ON TOP)
// ===========================
router.get("/search/query", searchPosts);

// ===========================
// 🌍 PUBLIC ROUTES
// ===========================
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// ===========================
// 🔐 AUTH REQUIRED ROUTES
// ===========================
router.post("/", auth, createPost);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);

// 🔥 FACEBOOK-STYLE REACTION
// POST /posts/:id/react
router.post("/:id/react", auth, reactToPost);

// ===========================
// 👑 ADMIN ROUTES
// ===========================
router.patch("/:id/approve", auth, admin, toggleApprovePost);

module.exports = router;
