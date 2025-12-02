const express = require("express");
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  toggleApprovePost, // ✅ NEW
} = require("../controllers/postController");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");


// ====================================================
// ⭐ PUBLIC ROUTES
// ====================================================

// Get all posts (only published posts are shown)
router.get("/", getAllPosts);

// Single post
router.get("/:id", getPostById);



// ====================================================
// 🔒 AUTHENTICATED USER ROUTES
// ====================================================

// Create post (user must be logged in)
router.post("/", auth, upload.single("coverImage"), createPost);

// Update your own post
router.put("/:id", auth, upload.single("coverImage"), updatePost);

// Delete your own post
router.delete("/:id", auth, deletePost);

// Like / Unlike post
router.post("/:id/like", auth, toggleLike);



// ====================================================
// 👑 ADMIN ROUTES
// ====================================================

// Approve / Unapprove post
router.patch("/:id/approve", auth, admin, toggleApprovePost);



module.exports = router;
