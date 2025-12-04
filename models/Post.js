const mongoose = require("mongoose");

const VALID_CATEGORIES = [
  "General",
  "Technology",
  "Lifestyle",
  "Business",
  "Design",
  "Sports",
  "Entertainment",
];

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    // SEO Friendly URL Slug
    slug: {
      type: String,
      unique: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ⭐ MULTIPLE CATEGORIES SUPPORTED
    categories: {
      type: [String],
      default: ["General"],
      validate: {
        validator: function (arr) {
          return arr.every((cat) => VALID_CATEGORIES.includes(cat));
        },
        message: "Invalid category selected",
      },
    },

    // ⭐ TAG SYSTEM (optional for future)
    tags: {
      type: [String],
      default: [],
    },

    // LIKE SYSTEM
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ADMIN APPROVAL (Publish / Unpublish)
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ======================================================
// 🔥 AUTO CREATE SLUG BEFORE SAVING POST
// ======================================================
postSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);