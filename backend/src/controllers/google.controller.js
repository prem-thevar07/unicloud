import { google } from "googleapis";
import { oauth2Client } from "../config/google.js";
import CloudAccount from "../models/CloudAccount.js";
import { normalizeGoogleFile } from "../utils/fileNormalizer.js";

/* ===============================
   GOOGLE OAUTH CALLBACK
=============================== */
export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

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
       HANDLE REFRESH TOKEN SAFELY
    =============================== */
    const existingAccount = await CloudAccount.findOne({
      userId: state,
      provider: "google",
    });

    const refreshToken =
      tokens.refresh_token || existingAccount?.refreshToken || null;

    /* ===============================
       SAVE ACCOUNT
    =============================== */
    await CloudAccount.findOneAndUpdate(
      { userId: state, provider: "google" },
      {
        userId: state,
        provider: "google",
        accessToken: tokens.access_token,
        refreshToken: refreshToken,
        scope: tokens.scope ? tokens.scope.split(" ") : [],
      },
      { upsert: true, new: true }
    );

    /* ===============================
       REDIRECT
    =============================== */
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("Google OAuth Error:", err.message);
    res.status(500).send("Google OAuth failed");
  }
};

/* ===============================
   FETCH GOOGLE FILES
=============================== */
export const getGoogleFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const account = await CloudAccount.findOne({
      userId,
      provider: "google",
    });

    if (!account) {
      return res.json([]);
    }

    /* ===============================
       CREATE CLIENT (CORRECT WAY ✅)
    =============================== */
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const drive = google.drive({ version: "v3", auth: client });

    /* ===============================
       SAFE FETCH (TIMEOUT PROTECTION 🔥)
    =============================== */
    const response = await Promise.race([
      drive.files.list({
        pageSize: 20,
        fields:
          "files(id,name,mimeType,size,thumbnailLink,webViewLink,createdTime)",
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Google API timeout")), 5000)
      ),
    ]);

    const files = response.data.files || [];

    const normalizedFiles = files.map(normalizeGoogleFile);

    res.json(normalizedFiles);
  } catch (err) {
    console.error("Fetch Google Files Error:", err.message);

    // 🔥 DO NOT CRASH SERVER
    res.json([]);
  }
};