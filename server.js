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

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow images from Cloudinary
  })
);

// Logging (dev only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allowed frontend domain
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// 🚀 API ROUTES
// --------------------------------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes")); // Admin routes

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Blogify API is running...");
});

// --------------------------------------------------
// ❌ 404 Handler
// --------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// --------------------------------------------------
// ⚠️ GLOBAL ERROR HANDLER (Always last)
// --------------------------------------------------
app.use(errorHandler);

// --------------------------------------------------
// 🟢 START SERVER
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
