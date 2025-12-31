import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";


const router = express.Router();

/**
 * UPDATE PROFILE (NAME)
 */
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const user = await User.findById(req.user.id);
        user.name = name;
        await user.save();

        res.json({
            message: "Profile updated",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

router.put("/password", authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update password" });
    }
});

router.delete("/google", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.google = undefined; // or null
    await user.save();

    res.json({ message: "Google Drive disconnected" });
  } catch (err) {
    res.status(500).json({ message: "Failed to disconnect Google Drive" });
  }
});


router.get("/profile/summary", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let storage = null;

    // If Google Drive connected
    if (user.google?.accessToken) {
      const { google } = await import("googleapis");

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: user.google.accessToken,
        refresh_token: user.google.refreshToken,
      });

      const drive = google.drive({
        version: "v3",
        auth: oauth2Client,
      });

      const about = await drive.about.get({
        fields: "storageQuota",
      });

      storage = {
        used: Number(about.data.storageQuota.usage) / (1024 ** 3),
        total: Number(about.data.storageQuota.limit) / (1024 ** 3),
      };
    }

    res.json({
      connectedAccounts: {
        googleDrive: !!user.google,
        oneDrive: false,
        dropbox: false,
      },
      storage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load profile summary" });
  }
});





export default router;
