const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
const errorHandler = require("./middleware/errorMiddleware");

// Load env
dotenv.config();

// App
const app = express();

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.error("MongoDB Error:", err));

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Root test
app.get("/", (req, res) => {
  res.send("Blogify Backend Running on Vercel 🚀");
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

// ❌ DO NOT use app.listen() on Vercel
// ✅ Export serverless handler
module.exports = serverless(app);
