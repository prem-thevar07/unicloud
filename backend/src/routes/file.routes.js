import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getAllFiles } from "../services/fileAggregator.service.js";
import { google } from "googleapis";
import CloudAccount from "../models/CloudAccount.js";

const router = express.Router();

/* ===============================
   GET ALL FILES
=============================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("📥 /api/files hit");

    const data = await getAllFiles(req.user.id, {
      view: req.query.view,
      type: req.query.type,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });

    console.log("📦 Sending response");

    return res.status(200).json(data); // 🔥 THIS WAS MISSING
  } catch (err) {
    console.error("❌ File Route Error:", err.message);

    return res.status(500).json({
      error: "Failed to fetch files",
    });
  }
});


router.get("/:fileId/thumbnail", authMiddleware, async (req, res) => {
  try {
    const { fileId } = req.params;

    console.log("🖼️ Thumbnail request:", fileId);

    const account = await CloudAccount.findOne({
      userId: req.user.id,
      provider: "google",
    });

    if (!account) {
      return res.status(404).send("No Google account connected");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error("❌ Thumbnail error:", err.message);
    res.status(500).send("Thumbnail failed");
  }
});

export default router;