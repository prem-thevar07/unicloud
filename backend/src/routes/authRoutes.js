import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

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
   GOOGLE LOGIN
=============================== */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth`,
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      /* ===============================
         REDIRECT TO FRONTEND (FIXED ✅)
      =============================== */
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/success?token=${token}`
      );
    } catch (err) {
      console.error("JWT creation failed:", err);
      res.redirect(`${process.env.FRONTEND_URL}/auth`);
    }
  }
);

export default router;
