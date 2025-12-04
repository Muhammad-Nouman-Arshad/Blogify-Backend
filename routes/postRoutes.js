const express = require("express");
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  toggleApprovePost,
  searchPosts, // ✅ ADD THIS
} = require("../controllers/postController");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");


// ====================================================
// ⭐ SEARCH ROUTE (must be BEFORE :id route)
// ====================================================
router.get("/search/query", searchPosts);


// ====================================================
// ⭐ PUBLIC ROUTES
// ====================================================

// Get all posts
router.get("/", getAllPosts);

// Get single post
router.get("/:id", getPostById);


// ====================================================
// 🔒 AUTHENTICATED USER ROUTES
// ====================================================

// Create post (NO image upload now)
router.post("/", auth, createPost);

// Update post (NO image upload now)
router.put("/:id", auth, updatePost);

// Delete your own post
router.delete("/:id", auth, deletePost);

// Like / Unlike
router.post("/:id/like", auth, toggleLike);


// ====================================================
// 👑 ADMIN ROUTES
// ====================================================

// Approve / Unapprove post
router.patch("/:id/approve", auth, admin, toggleApprovePost);


module.exports = router;
