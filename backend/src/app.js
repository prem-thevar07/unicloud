import express from "express";
import cors from "cors";
import passport from "passport";

import authRoutes from "./routes/authRoutes.js";
import googleRoutes from "./routes/google.routes.js";
import cloudRoutes from "./routes/cloud.routes.js";
import googleStorageRoutes from "./routes/google.storage.routes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profile.routes.js";

import "./config/googleAuth.js";

const app = express();

/* =======================
   ✅ CORS CONFIG (FINAL)
   Works for:
   - Localhost (Vite)
   - Netlify (Production)
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, mobile apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

/* =======================
   GLOBAL MIDDLEWARES
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

/* =======================
   ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/google", googleStorageRoutes);
app.use("/api/clouds", cloudRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);

/* =======================
   HEALTH CHECK
======================= */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
