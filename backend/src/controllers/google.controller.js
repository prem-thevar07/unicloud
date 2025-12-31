import { oauth2Client } from "../config/google.js";
import CloudAccount from "../models/CloudAccount.js";

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!state) {
      return res.status(400).send("Missing userId in state");
    }

    const { tokens } = await oauth2Client.getToken(code);

    await CloudAccount.create({
      userId: state, // ✅ real logged-in user ID
      provider: "google",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      scope: tokens.scope.split(" ")
    });

    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.error("Google OAuth Error:", err);
    res.status(500).send("Google OAuth failed");
  }
};
