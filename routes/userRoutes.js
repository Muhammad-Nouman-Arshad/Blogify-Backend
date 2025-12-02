// routes/userRoutes.js

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  registerAdmin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ---------------- Public Routes ----------------
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin Register (Public but protected using secret key)
router.post("/admin/register", registerAdmin);

// ---------------- User Private Routes ----------------
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

// ---------------- Admin Routes ----------------
router.get("/", auth, admin, getAllUsers);
router.get("/:id", auth, admin, getUserById);
router.put("/:id", auth, admin, updateUser);
router.delete("/:id", auth, admin, deleteUser);

module.exports = router;
