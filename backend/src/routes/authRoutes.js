import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import CloudAccount from "../models/CloudAccount.js";

import {
  register,
  login,
  verifyOTP,
  resendOTP,
} from "../controllers/authController.js";

const router = express.Router();

/* ===============================
   AUTH ROUTES
=============================== */
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/resend-otp", resendOTP);

/* ===============================
   GOOGLE LOGIN + DRIVE CONNECT
=============================== */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
    accessType: "offline",
    prompt: "consent",
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth`,
  }),
  async (req, res) => {
    try {
      /* ===============================
         SAVE GOOGLE DRIVE TOKENS ✅
      =============================== */
      const { accessToken, refreshToken } = req.authInfo || {};

      if (accessToken) {
        await CloudAccount.findOneAndUpdate(
          { userId: req.user._id, provider: "google" },
          {
            userId: req.user._id,
            provider: "google",
            accessToken,
            refreshToken,
            connectedAt: new Date(),
          },
          { upsert: true }
        );
      }

      /* ===============================
         ISSUE JWT
      =============================== */
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      /* ===============================
         REDIRECT TO FRONTEND
      =============================== */
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/success?token=${token}`
      );
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/auth`);
    }
  }
);

export default router;
