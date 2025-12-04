const Post = require("../models/Post");


// =========================================================
//  CREATE POST
// =========================================================
exports.createPost = async (req, res) => {
  try {
    const { title, content, categories } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const post = await Post.create({
      title,
      content,
      categories: Array.isArray(categories) ? categories : [],
      author: req.user.id,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================================================
//  GET ALL POSTS
// =========================================================
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================================================
//  GET SINGLE POST
// =========================================================
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json(post);
  } catch (error) {
    console.error("Get single post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================================================
//  UPDATE POST
// =========================================================
exports.updatePost = async (req, res) => {
  try {
    const { title, content, categories } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    if (Array.isArray(categories)) {
      post.categories = categories;
    }

    await post.save();

    return res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================================================
// DELETE POST
// =========================================================

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================================================
//  LIKE / UNLIKE
// =========================================================
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      await post.save();
      return res.status(200).json({ message: "Post unliked", post });
    }

    post.likes.push(userId);
    await post.save();

    return res.status(200).json({ message: "Post liked", post });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =========================================================
//  APPROVE / UNAPPROVE POST (ADMIN)
// =========================================================
exports.toggleApprovePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.isPublished = !post.isPublished;
    await post.save();

    return res.status(200).json({
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
//  SMART SEARCH (AI-LIKE RANKING)
// =========================================================
exports.searchPosts = async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || "";

    if (!query) {
      return res.json([]);
    }

    // break into words
    const keywords = query.split(" ");

    const posts = await Post.find().populate("author", "name");

    const scored = posts.map((post) => {
      let score = 0;

      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const categories = post.categories.join(" ").toLowerCase();
      const author = post.author?.name?.toLowerCase() || "";

      // scoring system
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

    // fallback: related content
    if (matched.length === 0) {
      const related = posts.slice(0, 5);
      return res.json({ related });
    }

    return res.json({ results: matched });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
