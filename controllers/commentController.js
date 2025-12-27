const Comment = require("../models/Comment");
const Post = require("../models/Post");

// ----------------------------------------------------
// ADD COMMENT ✅ (INCREMENT COUNT)
// ----------------------------------------------------
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const comment = await Comment.create({
      post: postId,
      user: req.user.id,
      text: text.trim(),
    });

    // 🔥 INCREMENT COMMENTS COUNT (ATOMIC)
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } },
      { new: true }
    );

    const populated = await comment.populate("user", "name email");

    res.status(201).json({
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
      .populate("replies.user", "name email")
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

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text cannot be empty" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text.trim();
    await comment.save();

    const populated = await comment.populate("user", "name email");

    res.status(200).json({
      message: "Comment updated",
      comment: populated,
    });
  } catch (err) {
    console.error("Edit comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------------
// DELETE COMMENT ✅ (DECREMENT COUNT SAFELY)
// ----------------------------------------------------
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const postId = comment.post;

    await comment.deleteOne();

    // 🔥 DECREMENT BUT NEVER BELOW ZERO
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: -1 },
    });

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------------
// REPLY TO A COMMENT (NO POST COUNT CHANGE)
// ----------------------------------------------------
exports.replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.replies.push({
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date(),
    });

    await comment.save();

    const populated = await comment.populate(
      "replies.user",
      "name email"
    );

    res.status(200).json({
      message: "Reply added",
      comment: populated,
    });
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
      .populate("user", "name email")
      .populate("post", "title");

    res.status(200).json(comments);
  } catch (err) {
    console.error("Get recent comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
