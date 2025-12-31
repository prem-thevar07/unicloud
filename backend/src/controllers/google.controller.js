import { oauth2Client } from "../config/google.js";
import CloudAccount from "../models/CloudAccount.js";

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    /* ===============================
       VALIDATION
    =============================== */
    if (!state) {
      return res.status(400).send("Missing userId in OAuth state");
    }

    if (!code) {
      return res.status(400).send("Missing OAuth authorization code");
    }

    /* ===============================
       EXCHANGE CODE FOR TOKENS
    =============================== */
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    /* ===============================
       SAVE / UPDATE CLOUD ACCOUNT
    =============================== */
    await CloudAccount.findOneAndUpdate(
      { userId: state, provider: "google" },
      {
        userId: state,
        provider: "google",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        scope: tokens.scope ? tokens.scope.split(" ") : [],
      },
      { upsert: true, new: true }
    );

    /* ===============================
       REDIRECT TO FRONTEND (FIXED ✅)
    =============================== */
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("Google OAuth Error:", err);
    res.status(500).send("Google OAuth failed");
  }
};
