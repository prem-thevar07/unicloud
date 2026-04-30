import CloudAccount from "../models/CloudAccount.js";

export const getAccounts = async (userId) => {
  console.log("📦 Fetching accounts for user:", userId);

  const accounts = await CloudAccount.find({ userId });

  const grouped = {};

  accounts.forEach((acc) => {
    if (!grouped[acc.provider]) {
      grouped[acc.provider] = [];
    }

    grouped[acc.provider].push({
      _id: acc._id,
      email: acc.email,
      provider: acc.provider,
      status: acc.status,
      storage: acc.storage,
      lastSyncedAt: acc.lastSyncedAt,
    });
  });

  return grouped;
};

export const deleteAccount = async (accountId, userId) => {
  console.log("🗑 Deleting account:", accountId);

  await CloudAccount.deleteOne({ _id: accountId, userId });

  return { success: true };
};