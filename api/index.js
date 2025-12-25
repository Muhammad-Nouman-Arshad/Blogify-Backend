const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoose = require("mongoose");
const errorHandler = require("../middleware/errorMiddleware");

dotenv.config();

const app = express();

/* =========================
   MongoDB (Serverless Safe)
========================= */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

connectDB();

/* =========================
   Middlewares
========================= */
app.use(helmet({ crossOriginResourcePolicy: false }));

// ✅ CORS — Local + Production
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://blogify-frontend-five.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   Routes
========================= */
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/users", require("../routes/userRoutes"));
app.use("/api/posts", require("../routes/postRoutes"));
app.use("/api/comments", require("../routes/commentRoutes"));
app.use("/api/admin", require("../routes/adminRoutes"));

/* =========================
   Test Route
========================= */
app.get("/", (req, res) => {
  res.send("Blogify Backend Running on Vercel 🚀");
});

/* =========================
   Error Handler
========================= */
app.use(errorHandler);

module.exports = app; // ❌ NO app.listen()
