import CloudAccount from "../models/CloudAccount.js";
import { fetchGoogleFiles } from "./providers/google.provider.js";
import { normalizeFile } from "../utils/fileNormalizer.js";

/* ===============================
   MAIN SERVICE
=============================== */
export const getAllFiles = async (userId, query = {}) => {
  try {
    const {
      view = "unified",
      type,
      search,
      mode = "all", // files | photos | all
      pageTokens = "{}"
    } = query;

    let parsedTokens = {};
    try {
      parsedTokens = JSON.parse(pageTokens);
    } catch (e) {
      console.warn("Invalid pageTokens JSON");
    }

    const newPageTokens = {};

    console.log("🔥 Fetching files with mode:", mode);

    /* ===============================
       1️⃣ GET ACCOUNTS
    =============================== */
    const accounts = await CloudAccount.find({ userId });

    if (!accounts.length) {
      console.log("⚠️ No accounts connected");
      return emptyResponse(view, {});
    }

    /* ===============================
       2️⃣ FETCH FILES (SAFE)
    =============================== */
    const results = await Promise.all(
      accounts.map(async (account) => {
        try {
          let files = [];
          const token = parsedTokens[account._id];
          
          // Skip if we already reached end of pagination for this account
          if (token === "EOF") {
            newPageTokens[account._id] = "EOF";
            return [];
          }

          if (account.provider === "google") {
            const res = await fetchGoogleFiles(account, token);
            
            files = res?.files || [];
            newPageTokens[account._id] = res?.nextPageToken || "EOF";
          }

          // 🔥 normalize safely
          return files
            .map((file) =>
              normalizeFile(
                file,
                account.provider,
                account._id,
                account.email
              )
            )
            .filter(Boolean);
        } catch (err) {
          console.error(`❌ ${account.provider} error:`, err.message);
          newPageTokens[account._id] = "EOF";
          return []; // never break system
        }
      })
    );

    /* ===============================
       3️⃣ MERGE
    =============================== */
    let allFiles = results.flat();

    /* ===============================
       4️⃣ MODE FILTER
    =============================== */
    if (mode === "files") {
      allFiles = allFiles.filter(
        (f) => f.type !== "image" && f.type !== "video"
      );
    }

    if (mode === "photos") {
      allFiles = allFiles.filter(
        (f) => f.type === "image" || f.type === "video"
      );
    }

    /* ===============================
       5️⃣ SEARCH
    =============================== */
    if (search) {
      const q = search.toLowerCase();
      allFiles = allFiles.filter((file) =>
        file.name?.toLowerCase().includes(q)
      );
    }

    /* ===============================
       6️⃣ TYPE FILTER
    =============================== */
    if (type) {
      allFiles = allFiles.filter((f) => f.type === type);
    }

    /* ===============================
       7️⃣ SORT
    =============================== */
    allFiles.sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    /* ===============================
       8️⃣ RESPONSE
    =============================== */
    let groupedData;
    if (view === "accounts") {
      groupedData = groupByAccounts(allFiles);
    } else {
      groupedData = groupByType(allFiles);
    }
    
    return {
      data: groupedData,
      nextPageTokens: newPageTokens
    };
  } catch (err) {
    console.error("🔥 Aggregator Error:", err.message);
    return emptyResponse(query.view, {});
  }
};

/* ===============================
   GROUP BY ACCOUNTS
=============================== */
const groupByAccounts = (files) => {
  const grouped = {};

  files.forEach((file) => {
    if (!file) return;

    if (!grouped[file.provider]) {
      grouped[file.provider] = {};
    }

    if (!grouped[file.provider][file.accountId]) {
      grouped[file.provider][file.accountId] = {
        email: file.accountEmail,
        files: [],
      };
    }

    grouped[file.provider][file.accountId].files.push(file);
  });

  return grouped;
};

/* ===============================
   GROUP BY TYPE
=============================== */
const groupByType = (files) => {
  const grouped = {
    image: [],
    video: [],
    document: [],
    other: [],
  };

  files.forEach((file) => {
    if (!file) return;

    if (grouped[file.type]) {
      grouped[file.type].push(file);
    } else {
      grouped.other.push(file);
    }
  });

  return grouped;
};

/* ===============================
   EMPTY RESPONSE
=============================== */
const emptyResponse = (view) => {
  if (view === "accounts") return { data: {}, nextPageTokens: {} };

  return {
    data: {
      image: [],
      video: [],
      document: [],
      other: [],
    },
    nextPageTokens: {}
  };
};
