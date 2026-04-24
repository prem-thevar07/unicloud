import api from "../config/api";

export const getFiles = async ({ view, type, search }) => {
  const params = new URLSearchParams();

  if (view) params.append("view", view);
  if (type) params.append("type", type);
  if (search) params.append("search", search);

  const res = await api.get(`/files?${params.toString()}`);
  return res.data;
};