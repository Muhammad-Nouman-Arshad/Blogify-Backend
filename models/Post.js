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

    // Cloudinary cover image
    coverImage: {
      type: String,
      default: "",
    },

    // ⭐ MULTIPLE CATEGORIES SUPPORTED
    categories: {
      type: [String],
      default: ["General"], // Default category
      validate: {
        validator: function (arr) {
          return arr.every((cat) => VALID_CATEGORIES.includes(cat));
        },
        message: "Invalid category selected",
      },
    },

    // ⭐ TAG SYSTEM
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

    // ADMIN APPROVAL (unpublished/published)
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
