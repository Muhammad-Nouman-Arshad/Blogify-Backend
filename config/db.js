const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

/* ===== MongoDB (Vercel Safe) ===== */
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

connectDB()
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.error(err));

/* ===== Middlewares ===== */
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ===== Routes ===== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* ===== Test Route ===== */
app.get("/", (req, res) => {
  res.send("Blogify Backend Running on Vercel 🚀");
});

/* ===== Error Handler ===== */
app.use(errorHandler);

/* ❌ NO app.listen() */
module.exports = app;
