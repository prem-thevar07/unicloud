import { google } from "googleapis";

/* ===============================
   SAFE GOOGLE FILE FETCHER 🔥
=============================== */
export const fetchGoogleFiles = async (account) => {
  try {
    console.log("🚀 Google fetch started");

    /* ===============================
       CREATE CLIENT (CORRECT WAY)
    =============================== */
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI // optional but good practice
    );

    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    /* ===============================
       SAFE API CALL (TIMEOUT PROTECTION 🔥)
    =============================== */
    const response = await Promise.race([
      drive.files.list({
        pageSize: 20,
        fields:
          "files(id,name,mimeType,size,thumbnailLink,webViewLink,createdTime)",
      }),

      // 🔥 TIMEOUT (prevents infinite hang)
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Google API timeout")), 4000)
      ),
    ]);

    console.log("✅ Google fetch success");

    return response.data.files || [];
  } catch (err) {
    console.error("❌ Google Provider Error:", err.message);

    // 🔥 NEVER BREAK SYSTEM
    return [];
  }
};