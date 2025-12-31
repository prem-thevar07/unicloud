import express from "express";
import {
  register,
  login,
  verifyOTP
} from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken"; 
import { resendOTP } from "../controllers/authController.js";


const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/resend-otp", resendOTP);




// GOOGLE LOGIN
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(
      `http://localhost:5173/auth/success?token=${token}`
    );
  }
);



export default router;
