// 🔥 LOAD ENV FIRST — BEFORE ANYTHING ELSE
import "./env.js";

import mongoose from "mongoose";
import app from "./src/app.js";

// ✅ Safe debug (optional — remove after testing)
if (process.env.NODE_ENV !== "production") {
  console.log("GOOGLE CLIENT ID loaded");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // fail fast if DB is down
  });
