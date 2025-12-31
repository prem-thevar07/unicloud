import express from "express";
import { oauth2Client } from "../config/google.js";
import { googleCallback } from "../controllers/google.controller.js";

const router = express.Router();

// Start Google OAuth (connect)
router.get("/connect", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send("Missing userId");
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.readonly"],
    state: userId
  });

  res.redirect(url);
});

// Google OAuth callback
router.get("/callback", googleCallback);

// 🔥 THIS LINE FIXES YOUR ERROR
export default router;
