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

    categories: {
      type: [String],
      default: ["General"],
      validate: {
        validator: (arr) =>
          arr.every((cat) => VALID_CATEGORIES.includes(cat)),
        message: "Invalid category selected",
      },
    },

    tags: {
      type: [String],
      default: [],
    },

    // 🔥 REACTIONS
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

    // 📊 COUNTERS (USED BY DASHBOARD)
    reactionsCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔥 AUTO SLUG
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
