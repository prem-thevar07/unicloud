import { google } from "googleapis";
import CloudAccount from "../models/CloudAccount.js";

// Initialize a generic OAuth2 client
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

// ================================
// IN-MEMORY CACHE
// ================================
const photoCache = new Map();

const getCache = (key) => {
  const item = photoCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    photoCache.delete(key);
    return null;
  }
  return item.value;
};

const setCache = (key, value, ttlSeconds = 300) => {
  photoCache.set(key, { value, expiry: Date.now() + (ttlSeconds * 1000) });
};

// ================================
// GET PHOTOS (Aggregated or Filtered)
// ================================
export const getPhotos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId, pageTokens, includeVideos } = req.body; // pageTokens is an object: { "accId1": "token", "accId2": "token" }

    // Check Cache
    const cacheKey = `photos_${userId}_${accountId || "all"}_${JSON.stringify(pageTokens || {})}_${!!includeVideos}`;
    const cachedData = getCache(cacheKey);
    
    if (cachedData) {
      console.log("Serving photos from cache for:", cacheKey);
      return res.json(cachedData);
    }

    // 1. Fetch connected accounts
    let accountsQuery = { userId, provider: "google" };
    if (accountId && accountId !== "all") {
      accountsQuery._id = accountId;
    }

    const accounts = await CloudAccount.find(accountsQuery);

    if (!accounts.length) {
      return res.json({ files: [], nextTokens: {} });
    }

    let allPhotos = [];
    let newTokens = {};

    // 2. Fetch from each account concurrently
    const fetchPromises = accounts.map(async (account) => {
      const accIdStr = account._id.toString();
      
      // If we previously reached the end of this account, skip it
      if (pageTokens && pageTokens[accIdStr] === "EOF") {
        newTokens[accIdStr] = "EOF";
        return;
      }

      const client = createOAuth2Client(account.accessToken, account.refreshToken);
      const drive = google.drive({ version: "v3", auth: client });

      const requestToken = pageTokens ? pageTokens[accIdStr] : undefined;
      const queryStr = req.body.includeVideos 
        ? "(mimeType contains 'image/' or mimeType contains 'video/') and trashed = false"
        : "mimeType contains 'image/' and trashed = false";

      try {
        const response = await drive.files.list({
          q: queryStr,
          fields: "nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, size, createdTime)",
          pageSize: 20, // 20 per account per load is good
          orderBy: "createdTime desc",
          pageToken: requestToken,
        });

        const files = response.data.files || [];
        
        // Add account info to each file for UI
        const enrichedFiles = files.map(file => ({
          ...file,
          accountId: accIdStr,
          accountEmail: account.email
        }));

        allPhotos.push(...enrichedFiles);
        
        if (response.data.nextPageToken) {
          newTokens[accIdStr] = response.data.nextPageToken;
        } else {
          newTokens[accIdStr] = "EOF";
        }
      } catch (err) {
        console.error(`Error fetching photos for account ${accIdStr}:`, err.message);
        // If auth error, skip. We don't crash the whole merged view.
      }
    });

    await Promise.all(fetchPromises);

    // 3. Sort merged results by createdTime descending
    allPhotos.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

    const responseData = {
      files: allPhotos,
      nextTokens: newTokens,
    };

    // Save to cache for 5 minutes (300 seconds)
    setCache(cacheKey, responseData, 300);

    res.json(responseData);
  } catch (err) {
    console.error("Get photos error:", err);
    res.status(500).json({ message: "Failed to fetch photos" });
  }
};
