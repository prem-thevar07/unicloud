import { google } from "googleapis";
import streamifier from "streamifier";
import CloudAccount from "../models/CloudAccount.js";

const createOAuth2Client = (accessToken, refreshToken) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return client;
};

// Helper: Get storage info for an account to determine free space
const getAccountStorageInfo = async (account) => {
  const client = createOAuth2Client(account.accessToken, account.refreshToken);
  const drive = google.drive({ version: "v3", auth: client });
  try {
    const res = await drive.about.get({ fields: "storageQuota" });
    const { limit, usage } = res.data.storageQuota;
    return {
      accountId: account._id.toString(),
      accountEmail: account.email,
      freeSpace: parseInt(limit || 0) - parseInt(usage || 0),
    };
  } catch (err) {
    return { accountId: account._id.toString(), freeSpace: 0 }; // Assume 0 if error
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { accountId } = req.body;
    const userId = req.user.id;

    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required" });
    }

    let targetAccount = null;

    if (accountId === "smart") {
      // Find the account with the most free space
      const accounts = await CloudAccount.find({ userId, provider: "google" });
      if (!accounts.length) {
        return res.status(404).json({ message: "No connected accounts found" });
      }

      // Check storage for all concurrently
      const storageInfos = await Promise.all(accounts.map(getAccountStorageInfo));

      // Sort descending by free space
      storageInfos.sort((a, b) => b.freeSpace - a.freeSpace);
      const bestAccountId = storageInfos[0].accountId;
      targetAccount = accounts.find(a => a._id.toString() === bestAccountId);

    } else {
      // Manual selection
      targetAccount = await CloudAccount.findOne({ _id: accountId, userId });
      if (!targetAccount) {
        return res.status(404).json({ message: "Account not found" });
      }
    }

    // Now upload to targetAccount
    const client = createOAuth2Client(targetAccount.accessToken, targetAccount.refreshToken);
    const drive = google.drive({ version: "v3", auth: client });

    const fileMetadata = {
      name: req.file.originalname,
    };

    const media = {
      mimeType: req.file.mimetype,
      body: (await import("fs")).createReadStream(req.file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    // Clean up temp file
    (await import("fs")).unlinkSync(req.file.path);

    res.json({
      message: "File uploaded successfully",
      file: response.data,
      uploadedTo: targetAccount.email
    });

  } catch (err) {
    import("fs").then(fs => fs.writeFileSync("upload-error.log", err.stack || err.message));
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Failed to upload file", error: String(err.message) });
  }
};
