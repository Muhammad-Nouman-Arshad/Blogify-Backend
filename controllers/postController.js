const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// =========================================================
//  CREATE POST
// =========================================================
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // ✅ FIX CATEGORY ARRAY (handles FormData JSON)
    let categories = [];
    if (req.body.categories) {
      try {
        categories = JSON.parse(req.body.categories);
      } catch {
        categories = [req.body.categories];
      }
    }

    let coverImage = "";

    // Image upload
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogify/posts",
      });
      coverImage = upload.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const post = await Post.create({
      title,
      content,
      categories: categories.length ? categories : [],
      coverImage,
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
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle categories (FormData + JSON)
    let categories = post.categories;
    if (req.body.categories) {
      try {
        categories = JSON.parse(req.body.categories);
      } catch {
        categories = [req.body.categories];
      }
    }

    // Image replacement
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogify/posts",
      });
      post.coverImage = upload.secure_url;
      fs.unlinkSync(req.file.path);
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.categories = categories;

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
//  DELETE POST
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
//  APPROVE / UNAPPROVE (ADMIN ONLY)
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
