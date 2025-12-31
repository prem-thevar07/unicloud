import express from "express";
import { google } from "googleapis";
import CloudAccount from "../models/CloudAccount.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/storage", auth, async (req, res) => {
    try {
        const account = await CloudAccount.findOne({
            userId: req.user.id,
            provider: "google"
        });

        if (!account) {
            return res.json({
                connected: false
            });
        }


        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        // 👇 THIS IS THE KEY FIX
        oauth2Client.setCredentials({
            refresh_token: account.refreshToken
        });

        // Auto-refresh access token
        const { credentials } = await oauth2Client.refreshAccessToken();

        // Save new access token
        account.accessToken = credentials.access_token;
        await account.save();

        const drive = google.drive({
            version: "v3",
            auth: oauth2Client
        });

        const about = await drive.about.get({
            fields: "storageQuota"
        });

        const { limit, usage } = about.data.storageQuota;

        res.json({
            connected: true,
            totalGB: Number((limit / 1024 / 1024 / 1024).toFixed(2)),
            usedGB: Number((usage / 1024 / 1024 / 1024).toFixed(2))
        });


    } catch (err) {
        console.error("GOOGLE STORAGE ERROR:", err);
        res.status(500).json({ message: "Failed to fetch storage" });
    }
});

export default router;
