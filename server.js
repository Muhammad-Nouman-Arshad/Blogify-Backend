const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

/* =========================
   MongoDB
========================= */
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected ✔");
  } catch (err) {
    console.error("MongoDB connection failed ❌", err.message);
    process.exit(1);
  }
};

connectDB();

/* =========================
   Middlewares
========================= */
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev")); // always helpful locally

/* =========================
   Routes
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* =========================
   Test Route
========================= */
app.get("/", (req, res) => {
  res.send("Blogify Backend Running 🚀");
});

/* =========================
   Error Handler
========================= */
app.use(errorHandler);

/* =========================
   LISTEN (LOCAL ONLY)
========================= */
const PORT = process.env.PORT || 5000;

/**
 * 👉 IMPORTANT:
 * Vercel sets process.env.VERCEL = "1"
 * So we listen ONLY when NOT on Vercel
 */
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app; // ✅ Vercel compatible
