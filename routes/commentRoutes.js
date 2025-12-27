const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  addComment,
  getCommentsByPost,
  editComment,
  deleteComment,
  replyToComment,
  getRecentComments,
} = require("../controllers/commentController");

// ==================================================
// PUBLIC ROUTES
// ==================================================

// Get all comments for a post
router.get("/post/:postId", getCommentsByPost);

// ==================================================
// AUTHENTICATED USER ROUTES
// ==================================================

// Add comment to a post
router.post("/post/:postId", auth, addComment);

// Edit own comment
router.put("/:commentId", auth, editComment);

// Delete own comment (admin can delete any)
router.delete("/:commentId", auth, deleteComment);

// Reply to a comment
router.post("/reply/:commentId", auth, replyToComment);

// ==================================================
// ADMIN ROUTES
// ==================================================

// Get recent comments (admin dashboard)
router.get("/admin/recent", auth, admin, getRecentComments);

module.exports = router;
