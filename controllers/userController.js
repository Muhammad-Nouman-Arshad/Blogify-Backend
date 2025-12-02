// controllers/userController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function: Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// --------------------------------------------------------
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
// --------------------------------------------------------
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user"
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token: generateToken(user),
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------------
// @desc    Login user
// @route   POST /api/users/login
// @access  Public
// --------------------------------------------------------
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    return res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user),
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------------
// @desc    Register Admin (Protected via Secret Key)
// @route   POST /api/users/admin/register
// @access  Public (but protected using ADMIN_SECRET)
// --------------------------------------------------------
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    if (!name || !email || !password || !adminKey)
      return res.status(400).json({ message: "All fields including adminKey are required" });

    // Secret key check
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid admin key" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      },
      token: generateToken(adminUser),
    });

  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------------
// @desc    Get logged-in user profile
// @route   GET /api/users/profile
// @access  Private
// --------------------------------------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(200).json(user);

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------------
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
// --------------------------------------------------------
exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).json({ message: "Profile updated", user });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------------
// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
// --------------------------------------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);

  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------------
// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
// --------------------------------------------------------
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);

  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------------
// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
// --------------------------------------------------------
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User updated", user });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------------
// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
// --------------------------------------------------------
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    await user.deleteOne();

    return res.status(200).json({ message: "User deleted" });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// ADMIN: APPROVE / UNAPPROVE POST
// ===============================

exports.toggleApprovePost = async (req, res, next) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // If missing in schema, initialize isPublished
    if (typeof post.isPublished === "undefined") {
      post.isPublished = false;
    }

    // Toggle
    post.isPublished = !post.isPublished;

    await post.save();

    return res.json({
      message: post.isPublished ? "Post approved" : "Post unpublished",
      post,
    });

  } catch (err) {
    console.error("Approve post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
