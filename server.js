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
   MongoDB (Vercel Safe)
========================= */
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected ✔");
  } catch (error) {
    console.error("MongoDB connection failed ❌", error.message);
    process.exit(1);
  }
};

connectDB();

/* =========================
   Middlewares
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // ✅ LIVE FRONTEND ONLY
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* =========================
   Routes
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* =========================
   Root Test Route
========================= */
app.get("/", (req, res) => {
  res.send("Blogify Backend Running on Vercel 🚀");
});

/* =========================
   Error Handling
========================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

/* =========================
   Export App (Vercel)
========================= */
module.exports = app; // ✅ REQUIRED FOR VERCEL
