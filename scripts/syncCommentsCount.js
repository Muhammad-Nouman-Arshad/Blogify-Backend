const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

require("dotenv").config();

// 🔌 DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

async function syncCommentsCount() {
  try {
    const posts = await Post.find();

    for (const post of posts) {
      const count = await Comment.countDocuments({
        post: post._id,
      });

      await Post.findByIdAndUpdate(post._id, {
        commentsCount: count,
      });
    }

    console.log("✅ commentsCount successfully synced");
    process.exit();
  } catch (err) {
    console.error("❌ Sync error:", err);
    process.exit(1);
  }
}

syncCommentsCount();
