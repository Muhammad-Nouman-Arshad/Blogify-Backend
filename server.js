// server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Load .env
dotenv.config();

// Create App
const app = express();

// Connect MongoDB
connectDB();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS Setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging (Dev only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Root
app.get("/", (req, res) => {
  res.send("Blogify Backend running on Render 🚀");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use(errorHandler);

// ✅ Render requires normal app.listen()
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});