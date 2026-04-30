// 🔥 LOAD ENV FIRST — BEFORE ANYTHING ELSE
import "./env.js";

import mongoose from "mongoose";
import app from "./src/app.js";

// 🔥 OPTIONAL BACKGROUND SERVICES (SAFE LOAD)
import "./src/services/sync.service.js";

/* =======================
   🔥 STARTUP DEBUG
======================= */
console.log("🚀 Starting Unicloud Backend...");

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("⚠️ GOOGLE_CLIENT_ID not set");
}

/* =======================
   DATABASE CONNECTION
======================= */
const connectDB = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast
    });

    console.log("✅ MongoDB connected");

    startServer();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

/* =======================
   START EXPRESS SERVER
======================= */
const startServer = () => {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log("📦 API Ready");
  });
};

/* =======================
   GLOBAL ERROR SAFETY
======================= */
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Promise Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err.message);
  process.exit(1);
});

/* =======================
   INIT
======================= */
connectDB();