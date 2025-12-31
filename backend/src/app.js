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
======================= */
const allowedOrigins = [
  "http://localhost:5173",            // local Vite
  process.env.FRONTEND_URL,           // Netlify
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(passport.initialize());

/* =======================
   ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/clouds", cloudRoutes);
app.use("/api/google", googleStorageRoutes);

app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);

/* =======================
   HEALTH CHECK (OPTIONAL)
======================= */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
