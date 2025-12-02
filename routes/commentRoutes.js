// routes/commentRoutes.js
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

// --------------------- PUBLIC ---------------------
router.get("/post/:postId", getCommentsByPost);

// --------------------- USER AUTH ---------------------
router.post("/post/:postId", auth, addComment);
router.put("/:commentId", auth, editComment);
router.delete("/:commentId", auth, deleteComment);
router.post("/reply/:commentId", auth, replyToComment);

// --------------------- ADMIN ONLY ---------------------
router.get("/admin/recent", auth, admin, getRecentComments);

module.exports = router;
