// config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // Stop app if DB fails
  }
};

// Graceful shutdown (optional but professional)
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("⚠️ MongoDB connection closed due to app termination");
  process.exit(0);
});

module.exports = connectDB;