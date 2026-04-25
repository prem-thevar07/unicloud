import { google } from "googleapis";

export const fetchGoogleFiles = async (account, pageToken = null) => {
  try {
    console.log("⏳ Google fetch start");

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const res = await drive.files.list({
      pageSize: 20, // 🔥 controlled
      pageToken,
      orderBy: "createdTime desc",
      fields:
        "nextPageToken, files(id,name,mimeType,size,thumbnailLink,webViewLink,createdTime)",
    });

    console.log("✅ Google fetch success");

    return {
      files: res.data.files || [],
      nextPageToken: res.data.nextPageToken || null,
    };
  } catch (err) {
    console.error("❌ Google failed:", err.message);
    return { files: [], nextPageToken: null };
  }
};