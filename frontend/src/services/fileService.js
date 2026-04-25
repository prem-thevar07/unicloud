import api from "../config/api";

export const getFiles = async ({
  view = "unified",
  type,
  search,
  mode = "files", // 🔥 default = files (important)
} = {}) => {
  try {
    const params = new URLSearchParams();

    if (view) params.append("view", view);
    if (type) params.append("type", type);
    if (search) params.append("search", search);
    if (mode) params.append("mode", mode); // 🔥 NEW

    const res = await api.get(`/files?${params.toString()}`);

    return res.data;
  } catch (err) {
    console.error("❌ getFiles error:", err);
    throw err;
  }
};