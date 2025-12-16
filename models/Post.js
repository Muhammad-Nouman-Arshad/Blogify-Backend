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

// 🔥 VALID REACTIONS (Facebook style)
const VALID_REACTIONS = [
  "like",
  "love",
  "haha",
  "wow",
  "sad",
  "angry",
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

    // ⭐ MULTIPLE CATEGORIES
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

    // ⭐ TAG SYSTEM (future-ready)
    tags: {
      type: [String],
      default: [],
    },

    // 🔥 FACEBOOK-STYLE REACTIONS
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: VALID_REACTIONS,
          default: "like",
        },
      },
    ],

    // 📊 QUICK COUNT (for performance)
    reactionsCount: {
      type: Number,
      default: 0,
    },

    // ADMIN APPROVAL
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ======================================================
// 🔥 AUTO CREATE SLUG BEFORE SAVE
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
