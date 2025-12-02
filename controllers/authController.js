const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");


// ==============================================================
// REGISTER USER
// ==============================================================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




// ==============================================================
// LOGIN USER  (🔥 AUTO-SET ADMIN ROLE)
// ==============================================================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Incorrect password" });


    // ===============================================
    // 🔥 FORCE ADMIN ROLE FOR SPECIFIC EMAIL
    // ===============================================
    if (user.email === "admin@gmail.com") {
      user.role = "admin";
      await user.save(); // <-- updates database
    }
    // ===============================================


    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,   // now correctly coming as "admin"
      },
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




// ==============================================================
// GET LOGGED-IN USER
// ==============================================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




// ==============================================================
// LOGOUT
// ==============================================================
exports.logoutUser = async (req, res) => {
  return res.status(200).json({
    message: "Logged out successfully",
  });
};
