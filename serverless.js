// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Load env
dotenv.config();

// Init app
const app = express();

// Connect MongoDB
connectDB();

// Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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
  res.send("Blogify API is running on Vercel 🚀");
});

// Error Handlers
app.use((req, res, next) => {
  return res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);

// ❌ No app.listen()
// ✔ Export module for Vercel
module.exports = app;
