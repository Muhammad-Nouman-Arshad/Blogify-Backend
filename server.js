// server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --------------------------------------------------
// 🔗 Connect to MongoDB
// --------------------------------------------------
connectDB();

// --------------------------------------------------
// 🌐 GLOBAL MIDDLEWARES
// --------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// 🚀 API ROUTES
// --------------------------------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Blogify API is running...");
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use(errorHandler);

// --------------------------------------------------
// ❗ NO app.listen() in Vercel
// --------------------------------------------------

// Export for Vercel Serverless Function
module.exports = app;