import CloudAccount from "../models/CloudAccount.js";
import { fetchGoogleFiles } from "./providers/google.provider.js";
import { normalizeFile } from "../utils/fileNormalizer.js";

/* ===============================
   SAFE PROMISE WITH TIMEOUT 🔥
=============================== */
const withTimeout = (promise, ms = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
};

/* ===============================
   MAIN SERVICE
=============================== */
export const getAllFiles = async (userId, query = {}) => {
  try {
    console.log("🔥 STEP 1: getAllFiles started");

    const {
      view = "unified",
      type,
      search,
      page = 1,
      limit = 20,
    } = query;

    /* ===============================
       1️⃣ GET ACCOUNTS
    =============================== */
    const accounts = await CloudAccount.find({ userId });

    if (!accounts.length) {
      console.log("⚠️ No accounts connected");
      return emptyResponse(view);
    }

    /* ===============================
       2️⃣ FETCH FILES (SAFE PARALLEL)
    =============================== */
    const results = await Promise.all(
      accounts.map(async (account) => {
        try {
          console.log(`👉 Fetching from ${account.provider}`);

          let files = [];

          if (account.provider === "google") {
            console.log("⏳ Google fetch start");

            const res = await withTimeout(
              fetchGoogleFiles(account),
              5000
            );

            // 🔥 FIX: extract files array correctly
            files = res?.files || [];

            console.log(`✅ Google fetch done (${files.length} files)`);
          }

          // Normalize safely
          return files
            .map((file) =>
              normalizeFile(file, account.provider, account._id)
            )
            .filter(Boolean);
        } catch (err) {
          console.error(
            `❌ ${account.provider} failed:`,
            err.message
          );
          return []; // NEVER BREAK SYSTEM
        }
      })
    );

    /* ===============================
       3️⃣ MERGE
    =============================== */
    let allFiles = results.flat();

    /* ===============================
       4️⃣ SEARCH
    =============================== */
    if (search) {
      const q = search.toLowerCase();

      allFiles = allFiles.filter((file) =>
        file.name?.toLowerCase().includes(q)
      );
    }

    /* ===============================
       5️⃣ TYPE FILTER
    =============================== */
    if (type) {
      allFiles = allFiles.filter((f) => f.type === type);
    }

    /* ===============================
       6️⃣ SORT (LATEST FIRST)
    =============================== */
    allFiles.sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    /* ===============================
       7️⃣ PAGINATION (FRONTEND LEVEL)
    =============================== */
    const start = (page - 1) * limit;
    const paginatedFiles = allFiles.slice(
      start,
      start + Number(limit)
    );

    /* ===============================
       8️⃣ RESPONSE
    =============================== */
    if (view === "accounts") {
      return groupByAccounts(paginatedFiles);
    } else {
      return groupByType(paginatedFiles);
    }
  } catch (err) {
    console.error("🔥 Aggregator Error:", err.message);
    return emptyResponse(query.view);
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
      grouped[file.provider][file.accountId] = [];
    }

    grouped[file.provider][file.accountId].push(file);
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
  if (view === "accounts") return {};

  return {
    image: [],
    video: [],
    document: [],
    other: [],
  };
};