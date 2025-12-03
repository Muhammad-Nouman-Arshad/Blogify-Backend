const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Load env
dotenv.config();

// Create app
const app = express();

// MongoDB Connection
connectDB();

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logs in Dev Mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Root testing
app.get("/", (req, res) => {
  res.send("Blogify API running on Vercel 🚀");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use(errorHandler);

// ❗ IMPORTANT — NO app.listen() for Vercel
module.exports = app;