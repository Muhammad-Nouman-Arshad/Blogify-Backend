const Post = require("../models/Post");

// =========================================================
// CREATE POST
// =========================================================
exports.createPost = async (req, res) => {
  try {
    const { title, content, categories, tags } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const post = await Post.create({
      title,
      content,
      categories: Array.isArray(categories) ? categories : ["General"],
      tags: Array.isArray(tags) ? tags : [],
      author: req.user.id,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name email role"
    );

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================================================
// GET ALL POSTS (PUBLIC)
// =========================================================
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isPublished: true })
      .populate("author", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================================================
// GET SINGLE POST
// =========================================================
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email role"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================================================
// UPDATE POST (ADMIN OR AUTHOR) ⭐ FINAL FIX
// =========================================================
exports.updatePost = async (req, res) => {
  try {
    const { title, content, categories, tags } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 🔐 AUTHORIZATION
    const isAuthor = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        message: "Only admin or post creator can edit this post",
      });
    }

    // ✅ SAFE UPDATE
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (Array.isArray(categories)) post.categories = categories;
    if (Array.isArray(tags)) post.tags = tags;

    await post.save(); // 🔥 slug middleware runs here

    const updatedPost = await Post.findById(post._id).populate(
      "author",
      "name email role"
    );

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================================================
// DELETE POST (ADMIN OR AUTHOR)
// =========================================================
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isAuthor = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================================================
// 🔥 FACEBOOK STYLE REACTIONS
// =========================================================
exports.reactToPost = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.id;

    const VALID_REACTIONS = [
      "like",
      "love",
      "haha",
      "wow",
      "sad",
      "angry",
    ];

    if (!VALID_REACTIONS.includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingIndex = post.reactions.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingIndex !== -1) {
      if (post.reactions[existingIndex].type === type) {
        post.reactions.splice(existingIndex, 1);
      } else {
        post.reactions[existingIndex].type = type;
      }
    } else {
      post.reactions.push({ user: userId, type });
    }

    post.reactionsCount = post.reactions.length;
    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "author",
      "name email role"
    );

    res.status(200).json({
      message: "Reaction updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Reaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================================================
// ADMIN APPROVE / UNAPPROVE POST
// =========================================================
exports.toggleApprovePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.isPublished = !post.isPublished;
    await post.save();

    res.status(200).json({
      message: post.isPublished
        ? "Post approved & published"
        : "Post unapproved & hidden",
      post,
    });
  } catch (error) {
    console.error("Approve post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================================================
// SMART SEARCH
// =========================================================
exports.searchPosts = async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || "";
    if (!query) return res.json([]);

    const keywords = query.split(" ");
    const posts = await Post.find({ isPublished: true }).populate(
      "author",
      "name"
    );

    const scored = posts.map((post) => {
      let score = 0;

      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const categories = post.categories.join(" ").toLowerCase();
      const author = post.author?.name?.toLowerCase() || "";

      keywords.forEach((k) => {
        if (title.includes(k)) score += 6;
        if (content.includes(k)) score += 4;
        if (categories.includes(k)) score += 5;
        if (author.includes(k)) score += 3;
      });

      return { post, score };
    });

    const matched = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.post);

    res.json(
      matched.length ? { results: matched } : { related: posts.slice(0, 5) }
    );
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
