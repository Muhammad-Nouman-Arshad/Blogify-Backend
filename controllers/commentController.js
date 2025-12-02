// controllers/commentController.js
const Comment = require("../models/Comment");
const Post = require("../models/Post");

// ----------------------------------------------------
// ADD COMMENT
// ----------------------------------------------------
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "")
      return res.status(400).json({ message: "Comment cannot be empty" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: postId,
      user: req.user.id,
      text: text.trim(),
    });

    const populated = await comment.populate("user", "name email");

    return res.status(201).json({
      message: "Comment added",
      comment: populated,
    });

  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ----------------------------------------------------
// GET COMMENTS FOR A POST
// ----------------------------------------------------
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);

  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ----------------------------------------------------
// EDIT COMMENT
// ----------------------------------------------------
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    comment.text = text || comment.text;
    await comment.save();

    res.status(200).json({ message: "Comment updated", comment });

  } catch (err) {
    console.error("Edit comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ----------------------------------------------------
// DELETE COMMENT
// ----------------------------------------------------
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted" });

  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ----------------------------------------------------
// REPLY TO A COMMENT
// ----------------------------------------------------
exports.replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text)
      return res.status(400).json({ message: "Reply text required" });

    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({
      user: req.user.id,
      text,
      createdAt: new Date(),
    });

    await comment.save();

    res.status(200).json({ message: "Reply added", comment });

  } catch (err) {
    console.error("Reply comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ----------------------------------------------------
// ADMIN: GET RECENT COMMENTS
// ----------------------------------------------------
exports.getRecentComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "name");

    res.status(200).json(comments);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
